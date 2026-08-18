// ANVAYA - Authentication API

const AuthApi = {
  async register(payload) {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (data && data.token) {
        localStorage.setItem(ANVAYA.TOKEN_KEY, data.token);
        localStorage.setItem(ANVAYA.USER_KEY, JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      }
      return data;
    } catch (err) {
      // Only fall back to demo mode on network errors (server unreachable)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Server unavailable - running in demo mode');
        const demoData = {
          token: 'demo_token_' + Date.now(),
          _id: 'demo_user_001',
          name: payload.name || 'Demo User',
          email: payload.email || 'demo@anvaya.in'
        };
        localStorage.setItem(ANVAYA.TOKEN_KEY, demoData.token);
        localStorage.setItem(ANVAYA.USER_KEY, JSON.stringify({ _id: demoData._id, name: demoData.name, email: demoData.email }));
        localStorage.setItem(ANVAYA.CASE_KEY, 'ANV-2026-0847');
        return demoData;
      }
      // Real API error - re-throw so the form shows it
      throw err;
    }
  },
  
  async login(payload) {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (data && data.token) {
        localStorage.setItem(ANVAYA.TOKEN_KEY, data.token);
        localStorage.setItem(ANVAYA.USER_KEY, JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      }
      return data;
    } catch (err) {
      // Only fall back to demo mode on network errors (server unreachable)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Server unavailable - running in demo mode');
        const demoData = {
          token: 'demo_token_' + Date.now(),
          _id: 'demo_user_001',
          name: 'Priya Sharma',
          email: payload.email || 'demo@anvaya.in'
        };
        localStorage.setItem(ANVAYA.TOKEN_KEY, demoData.token);
        localStorage.setItem(ANVAYA.USER_KEY, JSON.stringify({ _id: demoData._id, name: demoData.name, email: demoData.email }));
        localStorage.setItem(ANVAYA.CASE_KEY, 'ANV-2026-0847');
        return demoData;
      }
      // Real API error - re-throw so the form shows it
      throw err;
    }
  }
};
