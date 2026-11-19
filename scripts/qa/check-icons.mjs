import * as lucide from 'lucide-react';
const names = ['terminal','code','braces','repeat','git-branch','list','package','file-text','bug','cpu','memory-stick','layers','network','trophy','star','flag','rocket','compass','award','medal','target','zap','calendar-check','hammer','puzzle','brain','globe','gamepad-2','smartphone','server','bot','circuit-board','book-open','lightbulb'];
const pascal = (n) => n.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const missing = names.filter((n) => !(pascal(n) in lucide));
console.log(missing.length ? `missing: ${missing}` : `all ${names.length} icons exist`);
for (const n of ['Sun','Moon','Monitor','Menu','X','ChevronDown','Check','Copy','Download','Eye','FileText','Presentation','FileArchive','Image','File','CalendarDays','Clock','ArrowRight','ArrowLeft','Lock','Printer','ExternalLink','Circle','CircleCheck','CircleDashed','Search','Github','Link']) if (!(n in lucide)) console.log('ui missing', n);
