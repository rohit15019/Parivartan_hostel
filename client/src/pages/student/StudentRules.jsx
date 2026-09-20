import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ScrollText, 
  IndianRupee, 
  Smartphone, 
  GraduationCap, 
  CalendarDays, 
  Users, 
  Ban, 
  Sparkles, 
  Home, 
  ShieldAlert, 
  Lock, 
  MessageSquare, 
  Utensils, 
  Droplet, 
  Lightbulb, 
  BookOpen, 
  Clock, 
  Moon, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Filter,
  VolumeX,
  Armchair
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const rulesData = [
  {
    id: 1,
    rule: 'નિયત કરેલી ફી તારીખ ૧ થી ૫ સુધીમાં છાત્રાલયમાં સમયસર જમાં કરાવાની રહેશે.',
    category: 'fees',
    categoryName: 'ફી નિયમ',
    icon: IndianRupee,
    badgeVariant: 'warning',
    critical: false,
  },
  {
    id: 2,
    rule: 'ડિપોઝિટ રૂ.૫૦૦૦/જમા કરાવી ફરજિયાત છે જો ઝગડો અથવા નુકશાન કરવામાં આવશે તો ડિપોઝિટ પરત મળશે નહીં એડમિશન રદ કરવામાં આવશે',
    category: 'fees',
    categoryName: 'ડિપોઝિટ',
    icon: ShieldAlert,
    badgeVariant: 'danger',
    critical: true,
  },
  {
    id: 3,
    rule: 'મોબાઈલ ફોનમાં ગેમ અથવા કોઈપણ એપમાં રિલ્સ જોવામાં આવશે તો ૧૫ દિવસ માટે મોબાઈલ જમા રહેશે',
    category: 'discipline',
    categoryName: 'મોબાઈલ નિયમ',
    icon: Smartphone,
    badgeVariant: 'danger',
    critical: true,
  },
  {
    id: 4,
    rule: 'શાળા-કૉલેજ નિયમિત અભ્યાસ કરવા જવાનું રહેશે. કોઈ કારણસર શાળાએ ન જઈ શકાય તો તેની જાણ ફરજીયાત કરવાની રહેશે.',
    category: 'attendance',
    categoryName: 'હાજરી',
    icon: GraduationCap,
    badgeVariant: 'info',
    critical: false,
  },
  {
    id: 5,
    rule: 'રજા સીવાય છાત્રાલય છોડી શકાશે નહીં અન્યથા પ્રવેશ રદ કરી નાખવામાં આવશે અને જવાબદારી અમારે રહેશે નહીં.',
    category: 'attendance',
    categoryName: 'રજા નિયમ',
    icon: CalendarDays,
    badgeVariant: 'danger',
    critical: true,
  },
  {
    id: 6,
    rule: 'છાત્રાલયમાં મિત્રો કે અન્ય સગા-સબંધીઓ રાત્રિ રોકાણ કરી શકશે નહીં, વાલી આવે તેની જાણ કરવી તો જ તેઓની વ્યવસ્થા થશે.',
    category: 'facility',
    categoryName: 'મુલાકાતીઓ',
    icon: Users,
    badgeVariant: 'warning',
    critical: false,
  },
  {
    id: 7,
    rule: 'વ્યસન તેમજ માદક પદાર્થોનું સેવન ન કરવું અન્યથા પ્રવેશ રદ થશે.',
    category: 'discipline',
    categoryName: 'સખત મનાઈ',
    icon: Ban,
    badgeVariant: 'danger',
    critical: true,
  },
  {
    id: 8,
    rule: 'છાત્રાલયમાં પોતાના રૂમ ફરજીયાત સ્વચ્છ રહે તેની કાળજી રાખવી.',
    category: 'facility',
    categoryName: 'સ્વચ્છતા',
    icon: Sparkles,
    badgeVariant: 'success',
    critical: false,
  },
  {
    id: 9,
    rule: 'રૂમમાં દિવાલ પર લખાણ લખવું નહીં.',
    category: 'facility',
    categoryName: 'રૂમ જાળવણી',
    icon: Home,
    badgeVariant: 'info',
    critical: false,
  },
  {
    id: 10,
    rule: 'શાળા-કૉલેજ સમયે કોઇપણ બનાવ બનશે તો તેની જવાબદારી વિદ્યાર્થી તથા વાલીની રહેશે.',
    category: 'discipline',
    categoryName: 'જવાબદારી',
    icon: ShieldAlert,
    badgeVariant: 'warning',
    critical: false,
  },
  {
    id: 11,
    rule: 'વિદ્યાર્થી રજા સિવાય બહાર જશે તો તેની જવાબદારી અમારી રહેશે નહીં.',
    category: 'attendance',
    categoryName: 'જવાબદારી',
    icon: AlertTriangle,
    badgeVariant: 'danger',
    critical: true,
  },
  {
    id: 12,
    rule: 'કિંમતી વસ્તુઓ, રોકડ રકમ, મોબાઈલ વગેરે સાથે રાખવું નહીં. અન્યથા તેની જવાબદારી વિદ્યાર્થીની પોતાની રહેશે.',
    category: 'discipline',
    categoryName: 'સુરક્ષા',
    icon: Lock,
    badgeVariant: 'warning',
    critical: false,
  },
  {
    id: 13,
    rule: 'જ્યારે પણ ઘરે જવાનું આવવાનું છે ત્યારે ફરજિયાત પણે મેસેજ કરવાનો રહેશે અને જાણ પણ કરવાની રહેશે.',
    category: 'attendance',
    categoryName: 'સંચાર',
    icon: MessageSquare,
    badgeVariant: 'info',
    critical: false,
  },
  {
    id: 14,
    rule: 'અન્નનો બગાડ ન કરવો એ દરેક વિદ્યાર્થીની જવાબદારી રહેશે.',
    category: 'facility',
    categoryName: 'અન્ન સંરક્ષણ',
    icon: Utensils,
    badgeVariant: 'success',
    critical: false,
  },
  {
    id: 15,
    rule: 'પાણીનો બગાડ કરવો નહિ.',
    category: 'facility',
    categoryName: 'જળ સંરક્ષણ',
    icon: Droplet,
    badgeVariant: 'success',
    critical: false,
  },
  {
    id: 16,
    rule: 'રૂમની બહાર જતી વખતે લાઈટ, ફેન કે અન્ય ઈલેક્ટ્રોનિક ઉપકરણો બંધ કરવા ફરજિયાત છે.',
    category: 'facility',
    categoryName: 'વીજળી બચત',
    icon: Lightbulb,
    badgeVariant: 'success',
    critical: false,
  },
  {
    id: 17,
    rule: 'ફક્ત અભ્યાસ કરતા વિદ્યાર્થીને હોસ્ટેલમાં એડમિશન આપવામાં આવશે.',
    category: 'discipline',
    categoryName: 'પાત્રતા',
    icon: BookOpen,
    badgeVariant: 'info',
    critical: false,
  },
  {
    id: 18,
    rule: 'વાંચવાનો સમય ૦૮/૦૦ AM થી ૧૧/૩૦ AM ૦૮/૦૦ PM થી ૧૧/૩૦ PM (પરીક્ષા દરમિયાન વાંચવાના સમયમાં વધારો કરવામાં આવશે)',
    category: 'timings',
    categoryName: 'વાંચન સમય',
    icon: Clock,
    badgeVariant: 'warning',
    critical: false,
  },
  {
    id: 19,
    rule: 'રાત્રે 12/00 વાગ્યા પછી બહાર જવા દેવામાં આવશે નહીં.',
    category: 'timings',
    categoryName: 'નાઇટ કર્ફ્યુ',
    icon: Moon,
    badgeVariant: 'danger',
    critical: true,
  },
  {
    id: 21,
    rule: 'લાઈબ્રેરી રીડિંગ હોલમાં સંપૂર્ણ શાંતિ જાળવવી ફરજિયાત છે. મોટા અવાજે વાતચીત કે ગ્રુપ ડિસ્કશન કરવું સખત પ્રતિબંધિત છે.',
    category: 'library',
    categoryName: 'લાઈબ્રેરી શાંતિ',
    icon: VolumeX,
    badgeVariant: 'danger',
    critical: true,
  },
  {
    id: 22,
    rule: 'લાઈબ્રેરીમાં પ્રવેશતા પહેલા મોબાઈલ ફોન ફરજિયાત સાયલન્ટ અથવા વાઇબ્રેટ રાખવો. હોલની અંદર ફોન પર વાત કરવાની સખત મનાઈ છે.',
    category: 'library',
    categoryName: 'લાઈબ્રેરી મોબાઈલ',
    icon: Smartphone,
    badgeVariant: 'warning',
    critical: false,
  },
  {
    id: 23,
    rule: 'દરેક વિદ્યાર્થીએ પોતાને ફાળવેલ (Allocated) સીટ નંબર પર જ બેસવું. અન્ય વિદ્યાર્થીની સીટ પર પરવાનગી વગર બેસવું નહીં.',
    category: 'library',
    categoryName: 'સીટ શિસ્ત',
    icon: Armchair,
    badgeVariant: 'info',
    critical: false,
  },
  {
    id: 24,
    rule: 'લાઈબ્રેરી રીડિંગ ડેસ્ક પર ચા, નાસ્તો કે કોઈપણ ખાદ્ય સામગ્રી લાવવી નહીં (માત્ર પીવાના પાણીની બોટલ રાખી શકાશે).',
    category: 'library',
    categoryName: 'ખાદ્ય પ્રતિબંધ',
    icon: Utensils,
    badgeVariant: 'danger',
    critical: true,
  },
  {
    id: 25,
    rule: 'પુસ્તકો, સાહિત્ય, ટેબલ કે ખુરશી પર કોઈપણ લખાણ લખવું નહીં કે નુકસાન કરવું નહીં. ડેસ્ક હંમેશા સ્વચ્છ રાખવું.',
    category: 'library',
    categoryName: 'સાધન જાળવણી',
    icon: Sparkles,
    badgeVariant: 'success',
    critical: false,
  },
  {
    id: 26,
    rule: 'સીટ પરથી ઊભા થતી વખતે અથવા લાઈબ્રેરી છોડતી વખતે વ્યક્તિગત લાઈટ અને પંખાની સ્વિચ બંધ કરવી ફરજિયાત છે.',
    category: 'library',
    categoryName: 'વીજળી બચત',
    icon: Lightbulb,
    badgeVariant: 'success',
    critical: false,
  },
  {
    id: 27,
    rule: 'સમગ્ર લાઈબ્રેરી ૨૪x૭ CCTV કેમેરાની નજર હેઠળ છે. શિસ્તભંગ કરનાર વિદ્યાર્થીની સીટ ફાળવણી તાત્કાલિક રદ કરવામાં આવશે.',
    category: 'library',
    categoryName: 'CCTV શિસ્ત',
    icon: ShieldAlert,
    badgeVariant: 'danger',
    critical: true,
  },
];

const StudentRules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'બધા નિયમો (All Rules)' },
    { id: 'library', label: '📖 લાઈબ્રેરી નિયમો (Library Rules)' },
    { id: 'fees', label: 'ફી & ડિપોઝિટ (Fees)' },
    { id: 'discipline', label: 'શિસ્ત & આચારસંહિતા (Discipline)' },
    { id: 'attendance', label: 'હાજરી & રજા (Leaves/Attendance)' },
    { id: 'timings', label: 'સમય & વાંચન (Timings)' },
    { id: 'facility', label: 'સ્વચ્છતા & સુવિધાઓ (Hostel Care)' },
  ];

  const filteredRules = rulesData.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.rule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-800 text-white p-6 sm:p-8 shadow-xl border border-primary-500/20"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
            <ScrollText className="w-4 h-4" /> પરિવર્તન છાત્રાલય નિયમાવલી
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            છાત્રાલયના નિયમો (Hostel Rules & Regulations)
          </h1>
          <p className="text-primary-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            છાત્રાલયમાં શાંતિમય, સુરક્ષિત અને સંસ્કારી શૈક્ષણિક વાતાવરણ જાળવવા માટે દરેક વિદ્યાર્થીએ નીચે દર્શાવેલા નિયમોનું ચુસ્તપણે પાલન કરવું ફરજિયાત છે.
          </p>
        </div>
      </motion.div>

      {/* Quick Highlights / Key Rules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="h-full border-border/80 bg-gradient-to-br from-amber-500/10 via-card to-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">ફી જમા સમય</h3>
              <p className="text-xs text-black/70 dark:text-white/70">
                દર મહિનાની <strong>૧ થી ૫ તારીખ</strong> સુધીમાં સમયસર ફી જમા કરાવવી.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full border-border/80 bg-gradient-to-br from-indigo-500/10 via-card to-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">વાંચવાનો સમય</h3>
              <p className="text-xs text-black/70 dark:text-white/70">
                <strong>08:00 AM - 11:30 AM</strong> &amp;<br />
                <strong>08:00 PM - 11:30 PM</strong>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="h-full border-border/80 bg-gradient-to-br from-rose-500/10 via-card to-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">નાઇટ કર્ફ્યુ</h3>
              <p className="text-xs text-black/70 dark:text-white/70">
                રાત્રે <strong>12:00 વાગ્યા પછી</strong> બહાર જવા પર સખત પ્રતિબંધ છે.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full border-border/80 bg-gradient-to-br from-red-500/10 via-card to-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">ઝીરો ટોલરન્સ</h3>
              <p className="text-xs text-black/70 dark:text-white/70">
                ઝઘડો, નુકશાન કે વ્યસન કરવા બદલ <strong>તાત્કાલિક એડમિશન રદ</strong> થશે.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
            <input
              id="searchRulesInput"
              name="searchRulesInput"
              aria-label="Search rules by keyword"
              type="text"
              placeholder="નિયમો શોધો / Search rules by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-black/40 dark:text-white/40 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-card border border-border hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules List Grid */}
      <div className="space-y-3">
        {filteredRules.length > 0 ? (
          filteredRules.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className={`border transition-all duration-200 ${
                  item.critical 
                    ? 'border-red-200 dark:border-red-900/40 bg-gradient-to-r from-red-50/20 via-card to-card dark:from-red-950/10' 
                    : 'border-border hover:border-primary-500/40'
                }`}>
                  <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                    {/* Number & Icon Pill */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${
                        item.critical
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                          : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-black/40 dark:text-white/40">
                        #{item.id}
                      </span>
                    </div>

                    {/* Rule Text and Tag */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={item.badgeVariant} className="text-[10px] uppercase font-bold py-0.5">
                          {item.categoryName}
                        </Badge>
                        {item.critical && (
                          <Badge variant="danger" className="text-[10px] font-bold py-0.5 animate-pulse">
                            સખત નિયમ (Strict)
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                        {item.rule}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center p-8 bg-card border border-dashed border-border rounded-2xl space-y-2">
            <p className="text-sm text-black/50 dark:text-white/50">તમારા ફિલ્ટર મુજબ કોઈ નિયમ મળ્યો નથી.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              બધા નિયમો જુઓ
            </button>
          </div>
        )}
      </div>

      {/* Critical Rule #20 Highlight Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-2 border-red-500/50 bg-gradient-to-br from-red-500/15 via-red-500/5 to-card dark:from-red-950/40 dark:via-red-950/20 dark:to-card shadow-lg">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  નિયમ નં. ૨૦ • અતિ મહત્વપૂર્ણ સૂચના
                </span>
                <h3 className="text-lg sm:text-xl font-black text-foreground">
                  નિયમોના ચુસ્ત પાલન અંગેની શરત
                </h3>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-background/80 dark:bg-black/40 border border-red-200 dark:border-red-900/50">
              <p className="text-base sm:text-lg font-bold text-red-700 dark:text-red-300 leading-relaxed">
                “ઉપર્યુક્ત નિયમોનુ ચુસ્તપણે પાલન કરવાનું રહેશે જે કોઈ વિદ્યાર્થી આ નિયમોનું પાલન કરવામાં નિષ્ફળ રહેશે તો વાલીને મૌખીક જાણ કરી એડમીશન રદ કરવામાં આવશે.”
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-black/60 dark:text-white/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>સર્વે વિદ્યાર્થીઓ અને વાલીશ્રીઓ દ્વારા નિયમોની સ્વીકૃતિ અનિવાર્ય છે.</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentRules;
