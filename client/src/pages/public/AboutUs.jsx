import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Target, 
  Compass, 
  Users, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  UserCheck, 
  Sparkles, 
  Quote, 
  BookOpen, 
  LogIn, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2,
  Image as ImageIcon,
  ZoomIn,
  X,
  Camera
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';

// Import hostel photos from assets
import logoImg from '../../assets/logo.png';
import eventTrainingImg from '../../assets/event_training.jpg';
import hostelCampusImg from '../../assets/hostel_campus.jpg';
import hostelBuildingImg from '../../assets/hostel_building.jpg';

const photos = [
  {
    id: 1,
    src: eventTrainingImg,
    title: 'Student Training & Development Programs',
    subtitle: 'Educational Seminars & Social Transformation',
    description: 'Workshops, motivational speeches, and student gatherings fostering knowledge, discipline, and personal growth for over 11,000+ enrolled students.',
    tag: 'Empowerment & Education',
    featured: true
  },
  {
    id: 2,
    src: hostelCampusImg,
    title: 'Peaceful & Green Campus Grounds',
    subtitle: 'Tree-lined Courtyard & Clean Surroundings',
    description: 'Serene, natural outdoor grounds that provide students with a tranquil atmosphere for group discussions, recreation, and focused studies.',
    tag: 'Campus Environment',
    featured: false
  },
  {
    id: 3,
    src: hostelBuildingImg,
    title: 'Hostel Building & Student Living Spaces',
    subtitle: 'Patel Boarding, Surendranagar',
    description: 'Secure, well-maintained residential premises designed to support disciplined routines and comfortable student living since 2012.',
    tag: 'Hostel Facilities',
    featured: false
  }
];

const AboutUs = () => {
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Lightbox / Zoom Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-card rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                title="Close Full View"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain max-h-[70vh]"
                />
              </div>

              <div className="p-6 bg-card text-foreground">
                <div className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-2">
                  {selectedPhoto.tag}
                </div>
                <h3 className="text-xl font-bold text-foreground">{selectedPhoto.title}</h3>
                <p className="text-sm text-black/70 dark:text-white/70 mt-1">{selectedPhoto.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div 
            onClick={() => navigate('/login')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-border group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <img src={logoImg} alt="Parivartan Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight block text-foreground leading-none">
                Parivartan Hostel
              </span>
              <span className="text-xs text-black/50 dark:text-white/50 font-medium">
                Surendranagar, Gujarat
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-foreground transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Button 
              onClick={() => navigate('/login')} 
              className="gap-2 font-bold shadow-md shadow-primary-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Student / Admin Portal</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-primary-50/50 via-background to-background dark:from-primary-950/20 dark:via-background dark:to-background border-b border-border/50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-primary-500/10 to-indigo-500/10 blur-3xl pointer-events-none -z-10"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-2 shadow-xl border border-border/80 flex items-center justify-center">
                  <img src={logoImg} alt="Parivartan Hostel Logo" className="w-full h-full object-contain rounded-2xl" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider border border-primary-200 dark:border-primary-800/60 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" /> About Us • Established in 2012
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Welcome to <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">Parivartan Hostel</span>
              </h1>

              {/* Quote Card */}
              <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl backdrop-blur-md relative text-left">
                <Quote className="w-10 h-10 text-primary-500/20 absolute top-4 right-6" />
                <p className="text-xl sm:text-2xl font-bold text-foreground italic leading-snug">
                  “Social transformation is impossible without education.”
                </p>
                <p className="text-sm sm:text-base text-black/70 dark:text-white/70 mt-3 leading-relaxed">
                  With this vision at our core, we are committed to creating an environment where students can focus on learning, personal growth, discipline, and building a better future.
                </p>
              </div>

              {/* Guiding Principle Banner */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-primary-500/20">
                <BookOpen className="w-5 h-5" />
                <span>Our Guiding Principle: Learn Anytime, Anywhere.</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Photo Gallery Showcase */}
        <section className="py-16 lg:py-20 bg-black/[0.02] dark:bg-white/[0.02] border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Camera className="w-4 h-4" /> Campus Life & Activities
                </div>
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                  Life at Parivartan Hostel
                </h2>
                <p className="text-black/60 dark:text-white/60 text-sm mt-1">
                  A glimpse into our campus activities, training seminars, and open environment.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full border border-primary-200 dark:border-primary-800">
                Click any image to expand
              </span>
            </div>

            {/* Photo Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Photo 1: Large Featured Seminar Collage */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setSelectedPhoto(photos[0])}
                className="lg:col-span-6 group cursor-pointer"
              >
                <div className="h-full rounded-3xl overflow-hidden bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:border-primary-500/50">
                  <div className="relative aspect-[4/3] bg-black overflow-hidden">
                    <img 
                      src={photos[0].src} 
                      alt={photos[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-primary-600/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                        {photos[0].tag}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {photos[0].title}
                    </h3>
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {photos[0].subtitle}
                    </p>
                    <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                      {photos[0].description}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Photos 2 & 3 in Stacked Column */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {photos.slice(1).map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group cursor-pointer"
                  >
                    <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row lg:flex-row hover:border-primary-500/50 h-full">
                      <div className="relative w-full sm:w-2/5 lg:w-2/5 aspect-[4/3] sm:aspect-auto bg-black shrink-0 overflow-hidden">
                        <img 
                          src={photo.src} 
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[160px]" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/50 text-white backdrop-blur-md">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-center space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                          {photo.tag}
                        </span>
                        <h4 className="text-base font-bold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                          {photo.title}
                        </h4>
                        <p className="text-xs text-black/70 dark:text-white/70 line-clamp-2 leading-relaxed">
                          {photo.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Story & Background Section */}
        <section className="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Our Journey
              </div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                Empowering Students for Over a Decade
              </h2>
              <p className="text-base text-black/70 dark:text-white/70 leading-relaxed">
                Established in <strong>2012</strong>, Parivartan Hostel has been serving students by providing a supportive and inspiring space for their educational journey. Our mission is to make learning accessible and meaningful for everyone.
              </p>
              <p className="text-base text-black/70 dark:text-white/70 leading-relaxed">
                Over the years, we have grown into a vibrant community that values education as a powerful tool for positive social change. We aim to encourage students to develop knowledge, confidence, skills, and a strong sense of responsibility toward society.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Academic Focus</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Personal Growth</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Discipline & Values</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Social Responsibility</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-4"
            >
              {/* Vision Card */}
              <Card className="border-border shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-primary-50/20 dark:to-primary-950/20">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Our Vision</h3>
                  <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                    To empower students through education and contribute to meaningful social transformation.
                  </p>
                </CardContent>
              </Card>

              {/* Mission Card */}
              <Card className="border-border shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-indigo-50/20 dark:to-indigo-950/20">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Our Mission</h3>
                  <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                    Our mission is to provide a supportive learning environment where students can grow academically and personally, while developing the knowledge and values needed to create a positive impact on society.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Impact Counters */}
        <section className="py-16 bg-gradient-to-r from-primary-900 via-primary-950 to-indigo-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" /> Proven Track Record
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Impact</h2>
              <p className="text-primary-200 text-sm">
                Empowering generations of students with quality education, supportive mentorship, and dedicated infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary-500/20 text-primary-300 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-3xl lg:text-4xl font-black">11,000+</div>
                <div className="text-sm font-semibold text-primary-200">Students Enrolled</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-3xl lg:text-4xl font-black">50+</div>
                <div className="text-sm font-semibold text-primary-200">Certified Trainers</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="text-3xl lg:text-4xl font-black">14+ Years</div>
                <div className="text-sm font-semibold text-primary-200">Serving Since 2012</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-3xl lg:text-4xl font-black">100%</div>
                <div className="text-sm font-semibold text-primary-200">Dedicated Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information & Administration */}
        <section className="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5" /> Reach Out
            </div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Contact Information</h2>
            <p className="text-black/60 dark:text-white/60 text-sm">
              Have questions about admissions, facilities, or support? Feel free to contact our administration team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Address Card */}
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Hostel Address</h3>
                <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                  80 Foot Road, Near Desal Bhagat Ni Vav, Patel Boarding, Surendranagar – 363001, Gujarat, India
                </p>
              </CardContent>
            </Card>

            {/* Direct Contact Card */}
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Phone & Email</h3>
                <div className="space-y-2 text-sm text-black/70 dark:text-white/70">
                  <a 
                    href="tel:+919979999228" 
                    className="flex items-center gap-2 font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <Phone className="w-4 h-4 shrink-0" /> +91 99799 99228
                  </a>
                  <a 
                    href="mailto:vallabhdharejiya9@gmail.com" 
                    className="flex items-center gap-2 text-xs truncate font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <Mail className="w-4 h-4 shrink-0" /> vallabhdharejiya9@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Administration Spotlight */}
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-primary-50/30 dark:to-primary-950/30">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground">Hostel Administrator</h3>
                <p className="text-lg font-extrabold text-foreground">
                  Vallabhbhai Dharajiya
                </p>
                <p className="text-xs text-black/60 dark:text-white/60">
                  Dedicated leadership ensuring student welfare, security, and scholastic excellence since 2012.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action CTA */}
          <div className="mt-12 p-8 rounded-3xl bg-card border border-border shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-bold text-foreground">Ready to access your portal?</h3>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                Sign in with your student or administrator credentials to manage your account.
              </p>
            </div>
            <Button onClick={() => navigate('/login')} size="lg" className="gap-2 font-bold shadow-md shrink-0">
              <LogIn className="w-4 h-4" /> Go to Login Page
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card text-center text-xs text-black/50 dark:text-white/50">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} Parivartan Hostel. All rights reserved. • Established in 2012</p>
          <p>80 Foot Road, Near Desal Bhagat Ni Vav, Patel Boarding, Surendranagar – 363001, Gujarat, India</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
