import { root, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';
import { ColorPicker } from '@/components/mtc/MTCColorPickerState';
import { DummyStyle } from '@/components/ui/DummyStyle';
import { sleep } from '@/utils/sleep';
import type { HSL } from '@/types/color';

if (__BACKGROUND__) {
  setInterval(() => {
    sleep(250);
  }, 100);
}

export function App() {
  const [value, setValue] = useState<HSL>(() => [199, 99, 72]);

  const handleChange = (v: HSL) => {
    'use background';
    setValue(v);
  };

  return (
    <AppLayout
      title="MTC-State ColorPicker"
      subtitle="Coordinate on MTS"
      h={value[0]}
      s={value[1]}
      l={value[2]}
    >
      <DummyStyle />
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-48">
        <ColorPicker initialValue={value} onChange={handleChange} />
      </view>
    </AppLayout>
  );
}

root.render(<App />);
