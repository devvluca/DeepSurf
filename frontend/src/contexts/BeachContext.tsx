import { createClient } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

const supabase = createClient('https://<YOUR_PROJECT>.supabase.co', '<YOUR_ANON_KEY>');

const BeachContext = createContext(null);

export const BeachProvider = ({ children }) => {
  const [beaches, setBeaches] = useState([]);
  const [selectedBeachId, setSelectedBeachId] = useState(null);

  useEffect(() => {
    supabase.from('beaches').select('*').then(({ data }) => setBeaches(data || []));
  }, []);

  const selectedBeach = beaches.find(b => b.id === selectedBeachId) || beaches[0];

  return (
    <BeachContext.Provider value={{ beaches, selectedBeach, setSelectedBeachId }}>
      {children}
    </BeachContext.Provider>
  );
};

export const useBeach = () => useContext(BeachContext);
