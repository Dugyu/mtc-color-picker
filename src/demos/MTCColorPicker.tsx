import { root, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';
import { MTC } from '@/components/mtc/MTC';

type Color = readonly [number, number, number];

export function App() {
  const [value, _setValue] = useState<Color>([199, 99, 72]);

  return (
    <AppLayout title="MTC ColorPicker" h={value[0]} s={value[1]} l={value[2]}>
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-48">
        <MTC />
      </view>
    </AppLayout>
  );
}

root.render(<App />);
