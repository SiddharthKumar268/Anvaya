// client/js/voiceAssistant.js
// Siri-like Anvaya Voice Assistant (Speech Synthesis & Voice Intelligence)
// Provides natural, compassionate Text-to-Speech across Chat and Dashboard

(function (window) {
  'use strict';

  class VoiceAssistant {
    constructor() {
      this.synth = window.speechSynthesis || null;
      this.supported = !!this.synth && 'SpeechSynthesisUtterance' in window;
      this.voices = [];
      this.selectedVoice = null;
      this.currentUtterance = null;
      this.activeId = null;
      this.isPlaying = false;
      this.isPaused = false;
      let storedAuto = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          storedAuto = window.localStorage.getItem('anvaya_auto_speak');
        }
      } catch (e) {}
      this.autoSpeak = storedAuto === 'true';
      this.rate = 0.95; // Calm, respectful pace
      this.pitch = 1.0;
      this.callbacks = {};

      if (this.supported) {
        this._loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this._loadVoices();
        }
      }
    }

    _loadVoices() {
      if (!this.synth) return;
      this.voices = this.synth.getVoices() || [];
      this.selectedVoice = this._findBestVoice();
    }

    _findBestVoice() {
      if (!this.voices || this.voices.length === 0) return null;

      // 1. Prefer Indian English voice
      const indianVoice = this.voices.find(v =>
        v.lang === 'en-IN' ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('heera') ||
        v.name.toLowerCase().includes('veena') ||
        v.name.toLowerCase().includes('rishi')
      );
      if (indianVoice) return indianVoice;

      // 2. Fallback to British English (often softer and very clear)
      const gbVoice = this.voices.find(v =>
        v.lang === 'en-GB' ||
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('george') ||
        v.name.toLowerCase().includes('hazel')
      );
      if (gbVoice) return gbVoice;

      // 3. Fallback to US English or standard English
      const usVoice = this.voices.find(v => v.lang.startsWith('en'));
      if (usVoice) return usVoice;

      // 4. Default voice
      return this.voices[0] || null;
    }

    isSupported() {
      return this.supported;
    }

    getAutoSpeak() {
      return this.autoSpeak;
    }

    setAutoSpeak(enabled) {
      this.autoSpeak = !!enabled;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('anvaya_auto_speak', this.autoSpeak ? 'true' : 'false');
        }
      } catch (e) {}
      return this.autoSpeak;
    }

    cleanTextForSpeech(raw) {
      if (!raw) return '';

      let text = String(raw).trim();

      // Check if it is a JSON guided block: ```guided ... ```
      const guidedMatch = text.match(/```guided\s*([\s\S]*?)```/);
      if (guidedMatch) {
        try {
          const flow = JSON.parse(guidedMatch[1].trim());
          let spoken = 'Here is the step by step guidance for ' + (flow.title || 'your claim') + '. ';
          if (Array.isArray(flow.steps)) {
            flow.steps.forEach((step, idx) => {
              spoken += 'Step ' + (idx + 1) + ': ' + (step.heading || '') + '. ' + (step.detail || '') + '. ';
            });
          }
          if (flow.tip) {
            spoken += 'Important tip: ' + flow.tip + '. ';
          }
          return this._sanitizePlainSpeech(spoken);
        } catch (e) {
          // Fall through
        }
      }

      // Check if it is JSON or code block
      text = text.replace(/```(?:json|guided)?([\s\S]*?)```/g, '$1');

      return this._sanitizePlainSpeech(text);
    }

    _sanitizePlainSpeech(text) {
      return text
        // Remove markdown bold / italic / headers / bullets
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^[-*•]\s+/gm, 'Point: ')
        .replace(/^(\d+)\.\s+/gm, 'Step $1: ')
        // Currency and common symbol pronunciations
        .replace(/₹\s*([\d,]+)/g, '$1 Rupees')
        .replace(/Rs\.?\s*([\d,]+)/gi, '$1 Rupees')
        .replace(/%/g, ' percent ')
        .replace(/&/g, ' and ')
        .replace(/\+/g, ' plus ')
        .replace(/@/g, ' at ')
        // Remove URLs and emails
        .replace(/https?:\/\/\S+/g, 'official portal')
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'helpline email')
        // Remove HTML tags
        .replace(/<[^>]*>/g, ' ')
        // Clean double spaces and normalize punctuation pauses
        .replace(/\s+/g, ' ')
        .replace(/\.{2,}/g, '.')
        .trim();
    }

    speak(rawText, id, options) {
      if (!id) id = 'msg_' + Date.now();
      if (!options) options = {};

      if (!this.supported) {
        console.warn('[AnvayaVoice] Web Speech API not supported on this browser.');
        if (options.onError) options.onError(new Error('Speech not supported'));
        return false;
      }

      // Stop any current speech
      this.stop();

      const spokenText = this.cleanTextForSpeech(rawText);
      if (!spokenText) return false;

      this.activeId = id;
      this.isPlaying = true;
      this.isPaused = false;
      this.callbacks = options;

      // Chrome speech timeout workaround: split into sentences
      const sentences = spokenText.match(/[^.!?]+[.!?]+/g) || [spokenText];
      this._speakQueue(sentences, 0);

      return true;
    }

    _speakQueue(sentences, index) {
      if (!this.isPlaying || index >= sentences.length) {
        this._finish();
        return;
      }

      const sentence = sentences[index].trim();
      if (!sentence) {
        this._speakQueue(sentences, index + 1);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.voice = this.selectedVoice || this._findBestVoice();
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.lang = (this.selectedVoice && this.selectedVoice.lang) || 'en-IN';

      this.currentUtterance = utterance;

      if (index === 0 && this.callbacks.onStart) {
        this.callbacks.onStart(this.activeId);
      }

      utterance.onend = () => {
        this._speakQueue(sentences, index + 1);
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('[AnvayaVoice] Speech utterance error:', e.error);
          if (this.callbacks.onError) this.callbacks.onError(e);
        }
        this._finish();
      };

      this.synth.speak(utterance);
    }

    pause() {
      if (this.synth && this.isPlaying && !this.isPaused) {
        this.synth.pause();
        this.isPaused = true;
        if (this.callbacks.onPause) this.callbacks.onPause(this.activeId);
      }
    }

    resume() {
      if (this.synth && this.isPlaying && this.isPaused) {
        this.synth.resume();
        this.isPaused = false;
        if (this.callbacks.onResume) this.callbacks.onResume(this.activeId);
      }
    }

    stop() {
      if (this.synth) {
        this.synth.cancel();
      }
      this._finish();
    }

    _finish() {
      const prevId = this.activeId;
      this.isPlaying = false;
      this.isPaused = false;
      this.activeId = null;
      this.currentUtterance = null;

      if (this.callbacks.onEnd) {
        this.callbacks.onEnd(prevId);
      }
      this.callbacks = {};
    }

    toggle(rawText, id, callbacks) {
      if (!callbacks) callbacks = {};
      if (this.isPlaying && this.activeId === id) {
        if (this.isPaused) {
          this.resume();
        } else {
          this.stop();
        }
      } else {
        this.speak(rawText, id, callbacks);
      }
    }

    getActiveId() {
      return this.activeId;
    }
  }

  // Export singleton instance
  window.AnvayaVoice = new VoiceAssistant();

})(window);
