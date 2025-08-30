/* a dummy element to ensure classnames exist */
function DummyStyle() {
  return (
    <view className="hidden">
      <view className="relative flex-row items-center bg-primary px-5">
        <view className="absolute bg-secondary h-10"></view>
        <view className="absolute bg-white size-8 -translate-x-1/2 shadow-md"></view>
      </view>
    </view>
  );
}

export { DummyStyle };
