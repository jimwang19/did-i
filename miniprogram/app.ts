// 过门不忘 — 全局入口
App<IAppOption>({
  onLaunch() {},
});

interface IAppOption {
  onLaunch(): void;
}
