import {
  Award, BookOpen, Bot, Braces, Brain, CalendarCheck, CircuitBoard, Code, Compass, Cpu, FileText, Flag,
  Gamepad2, GitBranch, Globe, Hammer, Layers, Lightbulb, List, Medal, MemoryStick, Network, Package,
  Puzzle, Repeat, Rocket, Server, Smartphone, Star, Target, Terminal, Trophy, Zap, Bug,
  type LucideIcon, type LucideProps,
} from 'lucide-react';
import type { IconName } from '@/lib/model/enums';

const ICON_MAP: Record<IconName, LucideIcon> = {
  terminal: Terminal, code: Code, braces: Braces, repeat: Repeat, 'git-branch': GitBranch, list: List,
  package: Package, 'file-text': FileText, bug: Bug, cpu: Cpu, 'memory-stick': MemoryStick, layers: Layers,
  network: Network, trophy: Trophy, star: Star, flag: Flag, rocket: Rocket, compass: Compass, award: Award,
  medal: Medal, target: Target, zap: Zap, 'calendar-check': CalendarCheck, hammer: Hammer, puzzle: Puzzle,
  brain: Brain, globe: Globe, 'gamepad-2': Gamepad2, smartphone: Smartphone, server: Server, bot: Bot,
  'circuit-board': CircuitBoard, 'book-open': BookOpen, lightbulb: Lightbulb,
};

/** One of the fixed Lucide icons that content can choose (badges, fields). */
export function ContentIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = ICON_MAP[name] ?? Award;
  return <Icon aria-hidden="true" {...props} />;
}
