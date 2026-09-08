# 使用统计（帮助改进百应）接口说明

面向新后端对接：仅描述客户端现网埋点契约。

事件业务字段明细见 [`2026-06-22-usage-analytics-design.md`](./2026-06-22-usage-analytics-design.md) §2.4。

---

## 接口地址

```text
http://127.0.0.1:8899/api/client/analytics/rlog
```

常量：`LogReporterEndpoint.hzbAnalyzer`（`src/shared/analytics/constants.ts`）

---

## 请求方法

`GET`

- 无 Body
- Headers：空对象 `{}`（渲染进程）；主进程为 `session.defaultSession.fetch(url, { method: 'GET' })`
- 全部参数放在 Query String

---

## 请求参数

值为 `string | number | boolean`，序列化为字符串后写入 Query；`null` / `undefined` 不发送。

### 公共参数

| 参数 | 说明 |
|------|------|
| `_npid` | 固定 `wisdom` |
| `_ncat` | 固定 `actions` |
| `action` | 事件名，必须以 `baiying_` 开头，必填 |
| `app_version` | 应用版本 |
| `os_platform` | 系统，如 `win32` / `darwin` / `linux` |
| `os_arch` | 架构，如 `x64` / `arm64` |
| `language` | 界面语言，`zh` / `en` |
| `environment` | `production` / `development` / `test`（**仅渲染进程**） |
| `eventId` | 单次事件 ID（**仅渲染进程**） |
| `uuid` | 本机安装 ID（`installation_uuid`） |
| `firstKeyfrom` | 首次渠道归因 |
| `latestKeyfrom` | 最近渠道归因 |
| `is_logged_in` | 是否登录 |
| `log_Usid` | 用户 `yid`；未登录为空 |
| `identityType` | `free` / `subscription` / `enterprise`（**仅渲染进程**） |
| `is_subscriber` | 是否订阅中（**仅渲染进程**） |
| `subscriptionStatus` | 订阅状态，有值才带（**仅渲染进程**） |
| `uts` | 事件时间戳（毫秒） |

公共参数在业务参数之后写入，业务字段不得覆盖上述公共键。

### 业务参数

除公共参数外，各事件可附带扁平业务字段（随 `action` 变化），例如：

- `baiying_prompt_submit`：`surface`、`promptLength`、`hasPrompt`、`agentId`、…
- `baiying_skill_enabled`：`skillId`、`skillName`、…
- `baiying_general_setting_changed`：`settingKey`、`settingValue`、…

完整列表见既有设计文档 §2.4。`action` 枚举见 `LogReporterAction`。

### 门禁（客户端）

- 设置开关 `usageAnalyticsEnabled === false` 时不发送
- `action` 为空或不以 `baiying_` 开头时不发送

### 请求示例

```http
GET http://127.0.0.1:8899/api/client/analytics/rlog?action=baiying_prompt_submit&_npid=wisdom&_ncat=actions&app_version=2026.9.8&os_platform=win32&os_arch=x64&language=zh&environment=production&eventId=...&uuid=...&is_logged_in=true&log_Usid=...&identityType=free&is_subscriber=false&uts=1710000000000&surface=home&hasPrompt=true
```

---

## 返回结果

客户端**不解析响应 Body**，只根据 HTTP 状态判断成败：

| 条件 | 客户端行为 |
|------|------------|
| `response.ok === true`（通常 2xx） | 视为上报成功 |
| 非 ok 或网络异常 | 记失败日志，**不阻断**业务功能 |

响应体格式：客户端未使用。新后端对接时建议至少保证 2xx 表示接收成功；Body 可为空白或简单 JSON，客户端当前均可忽略。

---

## 实现入口

```text
Renderer: src/renderer/services/logReporter.ts → reportYdAnalyzer()
Main:     src/main/libs/mainLogReporter.ts     → MainLogReporter.report()
```

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-09-08 | 接口切换为 `http://127.0.0.1:8899/api/client/analytics/rlog` |
| 2026-09-08 | 精简为：地址、方法、参数、返回结果 |
