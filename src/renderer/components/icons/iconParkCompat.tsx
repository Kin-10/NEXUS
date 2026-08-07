import {
  Add as IconParkAdd,
  AddOne as IconParkAddOne,
  AlarmClock as IconParkAlarmClock,
  ArrowCircleUp as IconParkArrowCircleUp,
  ArrowDown as IconParkArrowDown,
  ArrowLeft as IconParkArrowLeft,
  ArrowRight as IconParkArrowRight,
  ArrowRightDown as IconParkArrowRightDown,
  ArrowUp as IconParkArrowUp,
  BellRing as IconParkBellRing,
  Brain as IconParkBrain,
  Branch as IconParkBranch,
  Briefcase as IconParkBriefcase,
  Broadcast as IconParkBroadcast,
  Calendar as IconParkCalendar,
  CalendarDot as IconParkCalendarDot,
  Caution as IconParkCaution,
  ChartHistogram as IconParkChartHistogram,
  Check as IconParkCheck,
  Checklist as IconParkChecklist,
  CheckOne as IconParkCheckOne,
  Clipboard as IconParkClipboard,
  Close as IconParkClose,
  CloseOne as IconParkCloseOne,
  CloseRemind as IconParkCloseRemind,
  CodeBrackets as IconParkCodeBrackets,
  Copy as IconParkCopy,
  Cpu as IconParkCpu,
  Cube as IconParkCube,
  DegreeHat as IconParkDegreeHat,
  Delete as IconParkDelete,
  Down as IconParkDown,
  Download as IconParkDownload,
  Edit as IconParkEdit,
  Envelope as IconParkEnvelope,
  ErrorPrompt as IconParkErrorPrompt,
  FileCabinet as IconParkFileCabinet,
  FileDoc as IconParkFileDoc,
  FileText as IconParkFileText,
  Flag as IconParkFlag,
  Folder as IconParkFolder,
  FolderOpen as IconParkFolderOpen,
  FolderPlus as IconParkFolderPlus,
  FullScreen as IconParkFullScreen,
  Globe as IconParkGlobe,
  Help as IconParkHelp,
  ImageFiles as IconParkImageFiles,
  Info as IconParkInfo,
  Key as IconParkKey,
  Left as IconParkLeft,
  Light as IconParkLight,
  Link as IconParkLink,
  Loading as IconParkLoading,
  Lock as IconParkLock,
  MagicWand as IconParkMagicWand,
  Message as IconParkMessage,
  Microphone as IconParkMicrophone,
  MindMapping as IconParkMindMapping,
  Minus as IconParkMinus,
  More as IconParkMore,
  MoreFour as IconParkMoreFour,
  NewspaperFolding as IconParkNewspaperFolding,
  OffScreenTwo as IconParkOffScreenTwo,
  Paperclip as IconParkPaperclip,
  PauseOne as IconParkPauseOne,
  Pencil as IconParkPencil,
  Peoples as IconParkPeoples,
  Phone as IconParkPhone,
  Play as IconParkPlay,
  PlayOne as IconParkPlayOne,
  Plug as IconParkPlug,
  PlugOne as IconParkPlugOne,
  PreviewClose as IconParkPreviewClose,
  PreviewOpen as IconParkPreviewOpen,
  Pushpin as IconParkPushpin,
  Puzzle as IconParkPuzzle,
  Refresh as IconParkRefresh,
  Right as IconParkRight,
  Robot as IconParkRobot,
  Rocket as IconParkRocket,
  RocketOne as IconParkRocketOne,
  Search as IconParkSearch,
  Send as IconParkSend,
  SettingConfig as IconParkSettingConfig,
  ShareThree as IconParkShareThree,
  Shield as IconParkShield,
  Speaker as IconParkSpeaker,
  Square as IconParkSquare,
  Sun as IconParkSun,
  Text as IconParkText,
  Tool as IconParkTool,
  Up as IconParkUp,
  Upload as IconParkUpload,
  Videocamera as IconParkVideocamera,
} from '@icon-park/react';
import React from 'react';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

type IconParkTheme = 'outline' | 'filled' | 'two-tone' | 'multi-color';

type IconParkBaseProps = React.ComponentProps<typeof IconParkAdd>;

export type IconProps = Omit<IconParkBaseProps, 'fill' | 'theme'> & {
  color?: string;
  fill?: string | string[];
  mirrored?: boolean;
  theme?: IconParkTheme;
  weight?: IconWeight;
};

type IconComponent = React.FC<IconProps>;

const themeForWeight = (weight: IconWeight | undefined): IconParkTheme => {
  if (weight === 'fill') {
    return 'filled';
  }

  if (weight === 'duotone') {
    return 'two-tone';
  }

  return 'outline';
};

const createIcon = (Icon: React.ComponentType<IconParkBaseProps>): IconComponent => {
  const IconParkCompat: IconComponent = ({ fill, mirrored, style, theme, weight, ...props }) => {
    const nextStyle =
      mirrored === true
        ? {
            ...style,
            transform: `${style?.transform ? `${style.transform} ` : ''}scaleX(-1)`,
          }
        : style;

    return (
      <Icon
        {...props}
        fill={fill ?? 'currentColor'}
        style={nextStyle}
        theme={theme ?? themeForWeight(weight)}
      />
    );
  };

  return IconParkCompat;
};

export const Archive = createIcon(IconParkFileCabinet);
export const ArrowBendDownRight = createIcon(IconParkArrowRightDown);
export const ArrowCircleUp = createIcon(IconParkArrowCircleUp);
export const ArrowDown = createIcon(IconParkArrowDown);
export const ArrowLeft = createIcon(IconParkArrowLeft);
export const ArrowRight = createIcon(IconParkArrowRight);
export const ArrowSquareOut = createIcon(IconParkShareThree);
export const ArrowUp = createIcon(IconParkArrowUp);
export const ArrowsClockwise = createIcon(IconParkRefresh);
export const ArrowsIn = createIcon(IconParkOffScreenTwo);
export const ArrowsOut = createIcon(IconParkFullScreen);
export const BellRinging = createIcon(IconParkBellRing);
export const BellSlash = createIcon(IconParkCloseRemind);
export const Brain = createIcon(IconParkBrain);
export const Briefcase = createIcon(IconParkBriefcase);
export const Broadcast = createIcon(IconParkBroadcast);
export const CalendarBlank = createIcon(IconParkCalendar);
export const CalendarDots = createIcon(IconParkCalendarDot);
export const CaretDown = createIcon(IconParkDown);
export const CaretLeft = createIcon(IconParkLeft);
export const CaretRight = createIcon(IconParkRight);
export const CaretUp = createIcon(IconParkUp);
export const ChartBar = createIcon(IconParkChartHistogram);
export const ChatCircle = createIcon(IconParkMessage);
export const ChatsCircle = createIcon(IconParkMessage);
export const Check = createIcon(IconParkCheck);
export const CheckCircle = createIcon(IconParkCheckOne);
export const CircleNotch = createIcon(IconParkLoading);
export const ClipboardText = createIcon(IconParkClipboard);
export const Clock = createIcon(IconParkAlarmClock);
export const CodeBlock = createIcon(IconParkCodeBrackets);
export const Copy = createIcon(IconParkCopy);
export const Cpu = createIcon(IconParkCpu);
export const Cube = createIcon(IconParkCube);
export const DeviceMobile = createIcon(IconParkPhone);
export const DotsThree = createIcon(IconParkMore);
export const DotsThreeVertical = createIcon(IconParkMoreFour);
export const DownloadSimple = createIcon(IconParkDownload);
export const Envelope = createIcon(IconParkEnvelope);
export const Eye = createIcon(IconParkPreviewOpen);
export const EyeSlash = createIcon(IconParkPreviewClose);
export const File = createIcon(IconParkFileDoc);
export const FileArrowDown = createIcon(IconParkDownload);
export const FileText = createIcon(IconParkFileText);
export const Flag = createIcon(IconParkFlag);
export const Folder = createIcon(IconParkFolder);
export const FolderOpen = createIcon(IconParkFolderOpen);
export const FolderPlus = createIcon(IconParkFolderPlus);
export const GearSix = createIcon(IconParkSettingConfig);
export const GitFork = createIcon(IconParkBranch);
export const Globe = createIcon(IconParkGlobe);
export const GraduationCap = createIcon(IconParkDegreeHat);
export const Image = createIcon(IconParkImageFiles);
export const Info = createIcon(IconParkInfo);
export const Key = createIcon(IconParkKey);
export const Lightbulb = createIcon(IconParkLight);
export const Link = createIcon(IconParkLink);
export const ListChecks = createIcon(IconParkChecklist);
export const Lock = createIcon(IconParkLock);
export const MagnifyingGlass = createIcon(IconParkSearch);
export const Microphone = createIcon(IconParkMicrophone);
export const Minus = createIcon(IconParkMinus);
export const MinusCircle = createIcon(IconParkMinus);
export const Newspaper = createIcon(IconParkNewspaperFolding);
export const NotePencil = createIcon(IconParkEdit);
export const PaperPlaneTilt = createIcon(IconParkSend);
export const Paperclip = createIcon(IconParkPaperclip);
export const Path = createIcon(IconParkMindMapping);
export const PauseCircle = createIcon(IconParkPauseOne);
export const PencilSimple = createIcon(IconParkPencil);
export const Play = createIcon(IconParkPlay);
export const PlayCircle = createIcon(IconParkPlayOne);
export const Plug = createIcon(IconParkPlug);
export const Plugs = createIcon(IconParkPlugOne);
export const Plus = createIcon(IconParkAdd);
export const PlusCircle = createIcon(IconParkAddOne);
export const PresentationChart = createIcon(IconParkChartHistogram);
export const PushPin = createIcon(IconParkPushpin);
export const PushPinSlash = createIcon(IconParkPushpin);
export const PuzzlePiece = createIcon(IconParkPuzzle);
export const Question = createIcon(IconParkHelp);
export const Robot = createIcon(IconParkRobot);
export const Rocket = createIcon(IconParkRocket);
export const RocketLaunch = createIcon(IconParkRocketOne);
export const ShareNetwork = createIcon(IconParkShareThree);
export const ShieldCheck = createIcon(IconParkShield);
export const Sparkle = createIcon(IconParkMagicWand);
export const SpeakerHigh = createIcon(IconParkSpeaker);
export const Stop = createIcon(IconParkSquare);
export const Sun = createIcon(IconParkSun);
export const TextT = createIcon(IconParkText);
export const Trash = createIcon(IconParkDelete);
export const UploadSimple = createIcon(IconParkUpload);
export const Users = createIcon(IconParkPeoples);
export const VideoCamera = createIcon(IconParkVideocamera);
export const Warning = createIcon(IconParkCaution);
export const WarningCircle = createIcon(IconParkErrorPrompt);
export const Wrench = createIcon(IconParkTool);
export const X = createIcon(IconParkClose);
export const XCircle = createIcon(IconParkCloseOne);
