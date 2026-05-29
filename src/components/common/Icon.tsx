import {
  Grid2X2, Users, Mic, FileText, Settings, ChevronRight,
  Bell, Search, Plus, Trash2, Mail, Lock, User, ShieldCheck,
  Check, AlertCircle, Info, LogOut, ArrowLeft, Download,
  Upload, RefreshCw, Eye, EyeOff, Filter, X, Edit3,
  ClipboardList, BarChart2, type LucideProps,
} from 'lucide-react'

const icons = {
  grid:         Grid2X2,
  users:        Users,
  audio:        Mic,
  report:       BarChart2,
  fileText:     FileText,
  settings:     Settings,
  chevronRight: ChevronRight,
  bell:         Bell,
  search:       Search,
  plus:         Plus,
  trash:        Trash2,
  mail:         Mail,
  lock:         Lock,
  user:         User,
  shield:       ShieldCheck,
  check:        Check,
  alert:        AlertCircle,
  info:         Info,
  logout:       LogOut,
  arrowLeft:    ArrowLeft,
  download:     Download,
  upload:       Upload,
  refresh:      RefreshCw,
  eye:          Eye,
  eyeOff:       EyeOff,
  filter:       Filter,
  x:            X,
  edit:         Edit3,
  clipboard:    ClipboardList,
}

type IconName = keyof typeof icons

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName
}

export function Icon({ name, size = 16, strokeWidth = 1.8, ...props }: IconProps) {
  const Component = icons[name]
  if (!Component) return null
  return <Component size={size} strokeWidth={strokeWidth} {...props} />
}
