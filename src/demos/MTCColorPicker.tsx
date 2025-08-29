import { root, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';
import { MTCColorPicker } from '@/components/mtc/MTCColorPicker';
import { DummyStyle } from '@/components/shared/DummyStyle';

type Color = readonly [number, number, number];

export function App() {
  const [value, setValue] = useState<Color>([199, 99, 72]);

  function onMTCValueChange(v: Color) {
    'use background';
    setValue(v);
  }

  return (
    <AppLayout title="MTC ColorPicker" h={value[0]} s={value[1]} l={value[2]}>
      <DummyStyle />
      <view
        className="w-60 h-12 flex-row justify-center items-center"
        bindtap={() => setValue([63, 100, 89])}
      >
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-48">
        <MTCColorPicker
          initialValue={value}
          onMTCValueChange={onMTCValueChange}
        />
      </view>
    </AppLayout>
  );
}

root.render(<App />);
