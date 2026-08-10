import {
  AlarmClock as LAlarmClock,
  Archive as LArchive,
  ArrowDown as LArrowDown,
  ArrowDownRight as LArrowDownRight,
  ArrowLeft as LArrowLeft,
  ArrowRight as LArrowRight,
  ArrowUp as LArrowUp,
  BarChart3 as LBarChart3,
  BellOff as LBellOff,
  BellRing as LBellRing,
  Bot as LBot,
  Box as LBox,
  Brain as LBrain,
  Briefcase as LBriefcase,
  Calendar as LCalendar,
  CalendarClock as LCalendarClock,
  CalendarDays as LCalendarDays,
  Check as LCheck,
  ChevronDown as LChevronDown,
  ChevronLeft as LChevronLeft,
  ChevronRight as LChevronRight,
  ChevronUp as LChevronUp,
  CircleAlert as LCircleAlert,
  CircleCheck as LCircleCheck,
  CircleHelp as LCircleHelp,
  CircleMinus as LCircleMinus,
  CirclePlus as LCirclePlus,
  CircleX as LCircleX,
  ClipboardList as LClipboardList,
  CodeXml as LCodeXml,
  Copy as LCopy,
  Cpu as LCpu,
  Download as LDownload,
  Ellipsis as LEllipsis,
  EllipsisVertical as LEllipsisVertical,
  Expand as LExpand,
  ExternalLink as LExternalLink,
  Eye as LEye,
  EyeOff as LEyeOff,
  File as LFile,
  FileDown as LFileDown,
  FileText as LFileText,
  Flag as LFlag,
  Folder as LFolder,
  FolderOpen as LFolderOpen,
  FolderPlus as LFolderPlus,
  GitFork as LGitFork,
  Globe as LGlobe,
  GraduationCap as LGraduationCap,
  Image as LImage,
  Info as LInfo,
  Key as LKey,
  LayoutGrid as LLayoutGrid,
  Lightbulb as LLightbulb,
  Link as LLink,
  ListChecks as LListChecks,
  LoaderCircle as LLoaderCircle,
  Lock as LLock,
  type LucideIcon,
  type LucideProps,
  Mail as LEnvelope,
  Menu as LMenu,
  MessageCircle as LMessageCircle,
  MessageSquare as LMessageSquare,
  Mic as LMicrophone,
  Minus as LMinus,
  Moon as LMoon,
  Newspaper as LNewspaper,
  NotebookPen as LNotebookPen,
  PanelLeftClose as LPanelLeftClose,
  PanelLeftOpen as LPanelLeftOpen,
  Paperclip as LPaperclip,
  PauseCircle as LPauseCircle,
  Pencil as LPencil,
  Pin as LPin,
  PinOff as LPinOff,
  Play as LPlay,
  PlayCircle as LPlayCircle,
  Plug as LPlug,
  Plus as LPlus,
  Presentation as LPresentation,
  Puzzle as LPuzzle,
  RadioTower as LRadioTower,
  RefreshCw as LRefreshCw,
  Rocket as LRocket,
  Search as LSearch,
  SendHorizontal as LSendHorizontal,
  Settings as LSettings,
  Share2 as LShare2,
  ShieldCheck as LShieldCheck,
  Shrink as LShrink,
  Smartphone as LSmartphone,
  Sparkles as LSparkles,
  Square as LSquare,
  SquarePen as LSquarePen,
  Sun as LSun,
  Trash2 as LTrash2,
  TriangleAlert as LTriangleAlert,
  Type as LType,
  Upload as LUpload,
  Users as LUsers,
  Video as LVideo,
  Volume2 as LVolume2,
  WandSparkles as LWandSparkles,
  Waypoints as LWaypoints,
  Wrench as LWrench,
  X as LX,
} from 'lucide-react';
import React from 'react';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export type IconProps = Omit<LucideProps, 'fill'> & {
  fill?: string | string[];
  mirrored?: boolean;
  theme?: 'outline' | 'filled' | 'two-tone' | 'multi-color' | 'none';
  weight?: IconWeight;
};

type IconComponent = React.FC<IconProps>;

const strokeWidthForWeight = (weight: IconWeight | undefined): number => {
  switch (weight) {
    case 'thin':
      return 1;
    case 'light':
      return 1.5;
    case 'bold':
      return 2.75;
    case 'fill':
      return 2.25;
    case 'duotone':
    case 'regular':
    default:
      return 2;
  }
};

const createIcon = (Icon: LucideIcon): IconComponent => {
  const LucideCompat: IconComponent = ({
    fill,
    mirrored,
    style,
    theme,
    weight,
    strokeWidth,
    ...props
  }) => {
    const nextStyle =
      mirrored === true
        ? {
            ...style,
            transform: `${style?.transform ? `${style.transform} ` : ''}scaleX(-1)`,
          }
        : style;
    const explicitFill = Array.isArray(fill) ? fill[0] : fill;
    const shouldFill = weight === 'fill' || theme === 'filled';
    const nextFill = shouldFill ? (explicitFill ?? 'currentColor') : 'none';

    return (
      <Icon
        {...props}
        fill={nextFill}
        strokeWidth={strokeWidth ?? strokeWidthForWeight(weight)}
        style={nextStyle}
      />
    );
  };

  return LucideCompat;
};

export const AddOne = createIcon(LCirclePlus);
export const Application = createIcon(LLayoutGrid);
export const Archive = createIcon(LArchive);
export const ArrowBendDownRight = createIcon(LArrowDownRight);
export const ArrowCircleUp = createIcon(LCirclePlus);
export const ArrowDown = createIcon(LArrowDown);
export const ArrowLeft = createIcon(LArrowLeft);
export const ArrowRight = createIcon(LArrowRight);
export const ArrowSquareOut = createIcon(LExternalLink);
export const ArrowUp = createIcon(LArrowUp);
export const ArrowsClockwise = createIcon(LRefreshCw);
export const ArrowsIn = createIcon(LShrink);
export const ArrowsOut = createIcon(LExpand);
export const BellRinging = createIcon(LBellRing);
export const BellSlash = createIcon(LBellOff);
export const Brain = createIcon(LBrain);
export const Briefcase = createIcon(LBriefcase);
export const Broadcast = createIcon(LRadioTower);
export const CalendarBlank = createIcon(LCalendar);
export const CalendarDots = createIcon(LCalendarDays);
export const CaretDown = createIcon(LChevronDown);
export const CaretLeft = createIcon(LChevronLeft);
export const CaretRight = createIcon(LChevronRight);
export const CaretUp = createIcon(LChevronUp);
export const Caution = createIcon(LTriangleAlert);
export const ChartBar = createIcon(LBarChart3);
export const ChatCircle = createIcon(LMessageCircle);
export const ChatsCircle = createIcon(LMessageCircle);
export const Check = createIcon(LCheck);
export const CheckCircle = createIcon(LCircleCheck);
export const CircleNotch = createIcon(LLoaderCircle);
export const ClipboardText = createIcon(LClipboardList);
export const Clock = createIcon(LAlarmClock);
export const CodeBlock = createIcon(LCodeXml);
export const Copy = createIcon(LCopy);
export const Cpu = createIcon(LCpu);
export const Cube = createIcon(LBox);
export const DeviceMobile = createIcon(LSmartphone);
export const Moon = createIcon(LMoon);
export const DotsThree = createIcon(LEllipsis);
export const DotsThreeVertical = createIcon(LEllipsisVertical);
export const DownloadSimple = createIcon(LDownload);
export const Envelope = createIcon(LEnvelope);
export const Eye = createIcon(LEye);
export const EyeSlash = createIcon(LEyeOff);
export const File = createIcon(LFile);
export const FileArrowDown = createIcon(LFileDown);
export const FileText = createIcon(LFileText);
export const Flag = createIcon(LFlag);
export const Folder = createIcon(LFolder);
export const FolderOpen = createIcon(LFolderOpen);
export const FolderPlus = createIcon(LFolderPlus);
export const GearSix = createIcon(LSettings);
export const GitFork = createIcon(LGitFork);
export const Globe = createIcon(LGlobe);
export const GraduationCap = createIcon(LGraduationCap);
export const Image = createIcon(LImage);
export const Info = createIcon(LInfo);
export const Key = createIcon(LKey);
export const Lightbulb = createIcon(LLightbulb);
export const Link = createIcon(LLink);
export const ListChecks = createIcon(LListChecks);
export const Lock = createIcon(LLock);
export const MagnifyingGlass = createIcon(LSearch);
export const MenuFold = createIcon(LPanelLeftClose);
export const MenuUnfold = createIcon(LPanelLeftOpen);
export const Message = createIcon(LMessageSquare);
export const Microphone = createIcon(LMicrophone);
export const Minus = createIcon(LMinus);
export const MinusCircle = createIcon(LCircleMinus);
export const Newspaper = createIcon(LNewspaper);
export const NotePencil = createIcon(LNotebookPen);
export const PaperPlaneTilt = createIcon(LSendHorizontal);
export const Paperclip = createIcon(LPaperclip);
export const Path = createIcon(LWaypoints);
export const PauseCircle = createIcon(LPauseCircle);
export const PencilSimple = createIcon(LPencil);
export const Play = createIcon(LPlay);
export const PlayCircle = createIcon(LPlayCircle);
export const Plug = createIcon(LPlug);
export const Plugs = createIcon(LPlug);
export const Plus = createIcon(LPlus);
export const PlusCircle = createIcon(LCirclePlus);
export const PresentationChart = createIcon(LPresentation);
export const PushPin = createIcon(LPin);
export const PushPinSlash = createIcon(LPinOff);
export const Puzzle = createIcon(LPuzzle);
export const PuzzlePiece = createIcon(LPuzzle);
export const Question = createIcon(LCircleHelp);
export const Robot = createIcon(LBot);
export const Rocket = createIcon(LRocket);
export const RocketLaunch = createIcon(LRocket);
export const Schedule = createIcon(LCalendarClock);
export const Search = createIcon(LSearch);
export const SettingConfig = createIcon(LSettings);
export const ShareNetwork = createIcon(LShare2);
export const ShieldCheck = createIcon(LShieldCheck);
export const Sparkle = createIcon(LSparkles);
export const SpeakerHigh = createIcon(LVolume2);
export const Stop = createIcon(LSquare);
export const Sun = createIcon(LSun);
export const TextT = createIcon(LType);
export const Trash = createIcon(LTrash2);
export const UploadSimple = createIcon(LUpload);
export const Users = createIcon(LUsers);
export const VideoCamera = createIcon(LVideo);
export const Warning = createIcon(LTriangleAlert);
export const WarningCircle = createIcon(LCircleAlert);
export const Wrench = createIcon(LWrench);
export const X = createIcon(LX);
export const XCircle = createIcon(LCircleX);

// Extra aliases used by small wrapper files and legacy naming.
export const Cog = createIcon(LSettings);
export const Compose = createIcon(LSquarePen);
export const Menu = createIcon(LMenu);
export const Skill = createIcon(LPuzzle);
export const Sparkles = createIcon(LSparkles);
export const WrenchMagic = createIcon(LWandSparkles);
