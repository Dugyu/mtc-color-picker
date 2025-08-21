import './App.css';

export function App() {
  return (
    <page className="dark bg-base-1 flex-col justify-center items-center">
      <text className="text-content text-3xl">Color Picker</text>
      <view className="rounded-full w-48 h-12 bg-primary flex-row justify-center items-center">
        <text className="text-primary-content">Enter</text>
      </view>
    </page>
  );
}
