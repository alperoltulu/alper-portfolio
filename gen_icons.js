const fs = require('fs');
const lucideIcons = ['Mail', 'Phone', 'MapPin', 'Globe', 'Link', 'Code', 'Terminal', 'Monitor', 'Smartphone', 'Cpu', 'Database', 'Cloud', 'Server', 'Wifi', 'Briefcase', 'GraduationCap', 'Award', 'Book', 'FileText', 'PenTool', 'Edit', 'Camera', 'Video', 'Music', 'Play', 'Pause', 'Heart', 'Star', 'ThumbsUp', 'MessageCircle', 'MessageSquare', 'Send', 'Search', 'Settings', 'User', 'Users', 'Home', 'Calendar', 'Clock', 'Bell', 'Check', 'CheckCircle', 'X', 'XCircle', 'AlertCircle', 'AlertTriangle', 'Info', 'HelpCircle', 'ShoppingCart', 'CreditCard', 'Activity', 'Zap', 'Flame', 'Droplet', 'Sun', 'Moon', 'CloudRain', 'Wind', 'Umbrella', 'Coffee', 'CupSoda', 'Pizza', 'Anchor', 'Compass', 'Map', 'Navigation', 'Truck', 'Plane', 'Rocket', 'Car', 'Smile', 'Frown', 'Meh', 'Eye', 'EyeOff', 'Lock', 'Unlock', 'Key', 'Shield', 'ShieldCheck', 'Folder', 'FolderOpen', 'Archive', 'Box', 'Paperclip', 'Download', 'Upload', 'RefreshCw', 'Maximize', 'Minimize', 'ZoomIn', 'ZoomOut', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown', 'Menu', 'MoreHorizontal', 'MoreVertical'];

const faIcons = ['FaGithub', 'FaLinkedin', 'FaTwitter', 'FaInstagram', 'FaYoutube', 'FaFacebook', 'FaTiktok', 'FaDiscord', 'FaTwitch', 'FaWhatsapp', 'FaTelegram', 'FaReddit', 'FaPinterest', 'FaMedium', 'FaDev', 'FaFigma', 'FaCodepen', 'FaDribbble', 'FaBehance', 'FaSpotify', 'FaSoundcloud', 'FaApple', 'FaWindows', 'FaLinux', 'FaNpm', 'FaReact', 'FaVuejs', 'FaAngular', 'FaNodeJs', 'FaPython', 'FaJava', 'FaPhp', 'FaHtml5', 'FaCss3', 'FaGit', 'FaAws', 'FaDocker', 'FaStripe', 'FaPaypal'];

let file = `import { \n  ${lucideIcons.join(',\n  ')}\n} from 'lucide-react';\n`;
file += `import { \n  ${faIcons.join(',\n  ')}\n} from 'react-icons/fa6';\n\n`;

file += `export const IconMap: Record<string, any> = {\n`;
for (const icon of lucideIcons) {
  file += `  ${icon}: ${icon},\n`;
}
for (const icon of faIcons) {
  // map FaGithub -> Github so user can just type 'Github'
  const name = icon.replace('Fa', '');
  file += `  ${name}: ${icon},\n`;
}
file += `};\n`;

fs.writeFileSync('src/lib/icons.ts', file);
