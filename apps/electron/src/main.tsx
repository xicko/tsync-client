import React, { useState } from 'react';
import { Text, Button, TamaguiProvider } from 'tamagui';
import { createRoot } from 'react-dom/client';
import { tamaguiConfig } from './theme/tamagui.config';
import './index.css';

function App() {
  const [count, setCount] = useState<number>(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Text>Count: {count}</Text>
      <Button onPress={() => setCount((prev) => prev + 1)}>Increment</Button>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <TamaguiProvider config={tamaguiConfig}>
        <App />
      </TamaguiProvider>
    </React.StrictMode>
  );
}
