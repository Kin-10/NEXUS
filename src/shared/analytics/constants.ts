export const LogReporterEndpoint = {
  /** BaiYing Server analytics beacon (GET query params). */
  hzbAnalyzer: 'http://127.0.0.1:8899/api/client/analytics/rlog',
} as const;

export const LogReporterProduct = {
  BaiYing: 'wisdom',
} as const;

export const LogReporterCategory = {
  Actions: 'actions',
} as const;

export const LogReporterActionPrefix = {
  BaiYing: 'baiying_',
} as const;

export const LogReporterAction = {
  AgentCreateAction: 'baiying_agent_create_action',
  AgentSettingsAction: 'baiying_agent_settings_action',
  AgentEngineMaintenanceAction: 'baiying_agent_engine_maintenance_action',
  AgentEngineSettingChanged: 'baiying_agent_engine_setting_changed',
  AboutAction: 'baiying_about_action',
  AccountMenuAction: 'baiying_account_menu_action',
  AppStarted: 'baiying_app_started',
  AppearanceSettingChanged: 'baiying_appearance_setting_changed',
  ArtifactPreviewAction: 'baiying_artifact_preview_action',
  ActivityClaimClick: 'baiying_activity_claim_click',
  ActivityClaimFail: 'baiying_activity_claim_fail',
  ActivityClaimSuccess: 'baiying_activity_claim_success',
  ActivityEntryClick: 'baiying_activity_entry_click',
  ActivityLoginRedirect: 'baiying_activity_login_redirect',
  ActivityLoginSuccess: 'baiying_activity_login_success',
  ActivityPopupClose: 'baiying_activity_popup_close',
  ActivityPopupExposure: 'baiying_activity_popup_exposure',
  AuthLifecycle: 'baiying_auth_lifecycle',
  BrowserSettingChanged: 'baiying_browser_setting_changed',
  CustomModelConnectionTested: 'baiying_custom_model_connection_tested',
  CustomModelSettingsSaved: 'baiying_custom_model_settings_saved',
  ConversationBlockAction: 'baiying_conversation_block_action',
  ConversationMessageAction: 'baiying_conversation_message_action',
  ConversationNavigationAction: 'baiying_conversation_navigation_action',
  DailyCheckInAction: 'baiying_daily_check_in_action',
  DreamingSettingChanged: 'baiying_dreaming_setting_changed',
  DshAction: 'baiying_dsh_action',
  EmailSkillConnectionTested: 'baiying_email_skill_connection_tested',
  EmailSkillSettingsSaved: 'baiying_email_skill_settings_saved',
  ExpertKitAction: 'baiying_expert_kit_action',
  ExpertKitSelected: 'baiying_expert_kit_selected',
  ExperimentalSettingChanged: 'baiying_experimental_setting_changed',
  GeneralSettingChanged: 'baiying_general_setting_changed',
  ImConnectionTested: 'baiying_im_connection_tested',
  ImGatewayToggled: 'baiying_im_gateway_toggled',
  ImInstanceChanged: 'baiying_im_instance_changed',
  ImPromptSubmit: 'baiying_im_prompt_submit',
  ImSettingsSaved: 'baiying_im_settings_saved',
  LibraryAction: 'baiying_library_action',
  MemoryEntryChanged: 'baiying_memory_entry_changed',
  MemorySettingChanged: 'baiying_memory_setting_changed',
  McpEnabled: 'baiying_mcp_enabled',
  McpAction: 'baiying_mcp_action',
  ModelSelected: 'baiying_model_selected',
  OnboardingAction: 'baiying_onboarding_action',
  PlanModeEnabled: 'baiying_plan_mode_enabled',
  PluginAction: 'baiying_plugin_action',
  PluginSettingsSaved: 'baiying_plugin_settings_saved',
  PublishingDialogAction: 'baiying_publishing_dialog_action',
  PublishingDialogExposure: 'baiying_publishing_dialog_exposure',
  PublishingEntryAction: 'baiying_publishing_entry_action',
  PublishingOperationResult: 'baiying_publishing_operation_result',
  PublishingRecoveryCtaAction: 'baiying_publishing_recovery_cta_action',
  PublishingRecoveryCtaExposure: 'baiying_publishing_recovery_cta_exposure',
  PublishingRecoveryResult: 'baiying_publishing_recovery_result',
  PublishingSubscriptionObserved: 'baiying_publishing_subscription_observed',
  PublishShareResult: 'baiying_publish_share_result',
  PublishCopyShareLink: 'baiying_publish_copy_share_link',
  PublishDeploymentResult: 'baiying_publish_deployment_result',
  PublishCopyDeployLink: 'baiying_publish_copy_deploy_link',
  DeploymentEditorExposure: 'baiying_deployment_editor_exposure',
  DeploymentEditorAction: 'baiying_deployment_editor_action',
  DeploymentStatusExposure: 'baiying_deployment_status_exposure',
  DeploymentStatusAction: 'baiying_deployment_status_action',
  PromptControlAction: 'baiying_prompt_control_action',
  PromptSubmit: 'baiying_prompt_submit',
  PromptTemplateAction: 'baiying_prompt_template_action',
  ShortcutSettingChanged: 'baiying_shortcut_setting_changed',
  SidebarAction: 'baiying_sidebar_action',
  SkillAction: 'baiying_skill_action',
  SkillEnabled: 'baiying_skill_enabled',
  ScheduledTaskAction: 'baiying_scheduled_task_action',
  TaskSearchAction: 'baiying_task_search_action',
  UsageAnalyticsEnabled: 'baiying_usage_analytics_enabled',
} as const;

export const PublishingRecoveryAnalyticsInteractionType = {
  RecoveryCta: 'recovery_cta',
} as const;

export type PublishingRecoveryAnalyticsInteractionType =
  typeof PublishingRecoveryAnalyticsInteractionType[
    keyof typeof PublishingRecoveryAnalyticsInteractionType
  ];

export const PublishingRecoveryAnalyticsSurface = {
  TaskFileShareDialog: 'task_file_share_dialog',
  TaskSiteDeploymentDialog: 'task_site_deployment_dialog',
  LibraryCloudList: 'library_cloud_list',
  LibraryFileDetail: 'library_file_detail',
  LibrarySiteDetail: 'library_site_detail',
} as const;

export type PublishingRecoveryAnalyticsSurface =
  typeof PublishingRecoveryAnalyticsSurface[keyof typeof PublishingRecoveryAnalyticsSurface];

export const PublishingRecoveryAnalyticsOutcome = {
  Restored: 'restored',
  RedeployReady: 'redeploy_ready',
  RetryExhausted: 'retry_exhausted',
  ResourceUnavailable: 'resource_unavailable',
} as const;

export type PublishingRecoveryAnalyticsOutcome =
  typeof PublishingRecoveryAnalyticsOutcome[keyof typeof PublishingRecoveryAnalyticsOutcome];

export type LogEventAction = `${typeof LogReporterActionPrefix.BaiYing}${string}`;

export const LogReporterEntry = {
  PromptToolsMenu: 'prompt_tools_menu',
} as const;

export const LogReporterSource = {
  OpenClawChannel: 'openclaw_channel',
  SettingsExperimental: 'settings_experimental',
} as const;

export const PromptAnalyticsSurface = {
  Home: 'home',
  Conversation: 'conversation',
} as const;

export type PromptAnalyticsSurface =
  typeof PromptAnalyticsSurface[keyof typeof PromptAnalyticsSurface];

export const PromptAnalyticsConversationState = {
  NewTask: 'new_task',
  ContinueSession: 'continue_session',
} as const;

export type PromptAnalyticsConversationState =
  typeof PromptAnalyticsConversationState[keyof typeof PromptAnalyticsConversationState];

export const LogReporterStoreKey = {
  AppConfig: 'app_config',
  AuthUser: 'auth_user',
  InstallationUuid: 'installation_uuid',
} as const;
