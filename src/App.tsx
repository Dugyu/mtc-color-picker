import { useState } from 'react';
import './App.css';

import { Slider } from './components/btc-slider/Slider';

export function App() {
  const [value, setValue] = useState<number>(120);

  return (
    <page className="dark bg-base-1 flex-col justify-center items-center">
      <text className="text-content text-3xl">Color Picker</text>
      <view className="rounded-full w-60 h-12 bg-primary flex-row justify-center items-center">
        <text className="text-primary-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-12">
        <Slider
          min={0}
          max={360}
          value={value}
          onChange={(value) => {
            setValue(value);
            console.log('updating');
          }}
          onCommit={(value) => {
            console.log('commit', value);
          }}
        />
      </view>
    </page>
  );
}
