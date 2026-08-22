import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  Home, 
  ShieldCheck, 
  Edit3, 
  X, 
  School,
  Lock,
  IndianRupee,
  Camera,
  Loader2,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Photo upload states
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/students/profile');
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  // Handle Photo Selection & Compression
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Selected image is too large. Please select an image under 10MB.');
      return;
    }

    setUploadingPhoto(true);
    setPhotoFeedback(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Resize / compress with canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 JPEG
        const base64Data = canvas.toDataURL('image/jpeg', 0.85);

        try {
          const res = await api.put('/students/profile/photo', { photo: base64Data });
          setProfile(prev => ({ ...prev, photo: res.data.photo }));
          if (updateUser) {
            updateUser({ photo: res.data.photo });
          }
          setPhotoFeedback('Photo updated successfully!');
          setTimeout(() => setPhotoFeedback(null), 4000);
        } catch (error) {
          console.error('Photo upload error:', error);
          alert(error.response?.data?.message || 'Failed to upload photo');
        } finally {
          setUploadingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.onerror = () => {
        setUploadingPhoto(false);
        alert('Failed to process the selected image.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestText.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/profile-requests', { requestText });
      alert('Change request sent to admin for approval.');
      setShowModal(false);
      setRequestText('');
    } catch (error) {
      console.error('Failed to submit request', error);
      alert(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-black/50 dark:text-white/50 text-base">Loading profile details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <p className="text-black/50 dark:text-white/50">Student profile records not found.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge variant="success">🟢 Active</Badge>;
      case 'Away': return <Badge variant="warning">🟡 Away</Badge>;
      case 'Left': return <Badge variant="danger">🔴 Left</Badge>;
      default: return <Badge>{status || 'Active'}</Badge>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-black/60 dark:text-white/60 text-sm">
            View your complete student information registered with the hostel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 font-medium border border-border">
            <Lock className="w-3.5 h-3.5" /> Read-only • Managed by Admin
          </span>
          <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
            <Edit3 className="w-4 h-4" /> Request Update
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
          <Card className="text-center overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-900 dark:to-primary-800 w-full relative">
              <div className="absolute top-3 right-3">
                {getStatusBadge(profile.status)}
              </div>
            </div>
            <CardContent className="px-6 pb-6 pt-0 relative">
              {/* Clickable Avatar Photo Upload Box */}
              <div 
                onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                className="w-24 h-24 mx-auto bg-card rounded-2xl p-1 -mt-12 mb-2 relative z-10 shadow-lg border-2 border-border flex items-center justify-center cursor-pointer group hover:border-primary-500 transition-all hover:scale-105"
                title="Click to upload or change your photo"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoSelect} 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="hidden" 
                />

                {uploadingPhoto ? (
                  <div className="w-full h-full bg-black/60 rounded-xl flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-[9px] mt-1 font-semibold">Saving...</span>
                  </div>
                ) : profile.photo ? (
                  <div className="w-full h-full relative rounded-xl overflow-hidden">
                    <img 
                      src={profile.photo} 
                      alt={profile.name} 
                      className="w-full h-full object-cover" 
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">Change</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-primary-100 dark:bg-primary-900/50 rounded-xl flex flex-col items-center justify-center text-3xl font-bold text-primary-700 dark:text-primary-300 relative overflow-hidden">
                    <span>{(profile.name || 'U').charAt(0)}</span>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">Upload</span>
                    </div>
                  </div>
                )}

                {/* Camera Badge in bottom corner */}
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary-600 text-white shadow-md border-2 border-card group-hover:bg-primary-700 transition-colors pointer-events-none">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-[11px] text-black/50 dark:text-white/50 mb-3 font-medium">
                {profile.photo ? 'Click photo to change' : 'Click letter box to upload photo'}
              </p>

              {photoFeedback && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mb-3 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-900/50"
                >
                  <Check className="w-3.5 h-3.5" /> {photoFeedback}
                </motion.div>
              )}

              <h2 className="text-xl font-bold text-foreground truncate px-2" title={`${profile.name || ''} ${profile.surname || ''}`}>
                {profile.name} {profile.surname}
              </h2>
              <p className="text-primary-600 dark:text-primary-400 font-mono font-semibold text-sm mt-0.5 truncate" title={profile.studentId}>
                {profile.studentId}
              </p>
              
              <div className="mt-6 pt-4 border-t border-border space-y-3 text-left">
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-black/50 dark:text-white/50 flex items-center gap-2 shrink-0">
                    <Home className="w-4 h-4 text-primary-500" /> Assigned Room:
                  </span>
                  <span className="font-bold px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md truncate max-w-[140px]" title={`Room ${profile.roomNumber || 'N/A'}`}>
                    Room {profile.roomNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-black/50 dark:text-white/50 flex items-center gap-2 shrink-0">
                    <IndianRupee className="w-4 h-4 text-emerald-500" /> Deposit Paid:
                  </span>
                  <span className="font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md truncate max-w-[140px]" title={`₹${Number(profile.deposit || 0).toLocaleString()}`}>
                    ₹{Number(profile.deposit || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-black/50 dark:text-white/50 flex items-center gap-2 shrink-0">
                    <Calendar className="w-4 h-4 text-primary-500" /> Date of Birth:
                  </span>
                  <span className="font-medium truncate max-w-[140px]" title={formatDate(profile.dob)}>
                    {formatDate(profile.dob)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm gap-2">
                  <span className="text-black/50 dark:text-white/50 flex items-center gap-2 shrink-0">
                    <ShieldCheck className="w-4 h-4 text-primary-500" /> Admission Date:
                  </span>
                  <span className="font-medium truncate max-w-[140px]" title={formatDate(profile.joiningDate || profile.createdAt)}>
                    {formatDate(profile.joiningDate || profile.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Notice Card */}
          <Card className="bg-primary-50/50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/30">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-semibold text-primary-800 dark:text-primary-300 uppercase tracking-wide">
                Need to change information?
              </p>
              <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed">
                To maintain hostel database accuracy, profile records are managed by the administration. Click <strong>Request Update</strong> to submit a correction.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Detailed Field Sections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Personal & Contact Information */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary-500" /> Personal & Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Student Name</span>
                  <span className="text-sm font-semibold truncate block" title={profile.name || 'N/A'}>
                    {profile.name || 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Surname</span>
                  <span className="text-sm font-semibold truncate block" title={profile.surname || 'N/A'}>
                    {profile.surname || 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Student Phone No.</span>
                  <span className="text-sm font-semibold flex items-center gap-1.5 min-w-0" title={profile.phone || 'N/A'}>
                    <Phone className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="truncate">{profile.phone || 'N/A'}</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Account Email</span>
                  <span className="text-sm font-semibold flex items-center gap-1.5 min-w-0" title={profile.userId?.email || user?.email || 'N/A'}>
                    <Mail className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="truncate">{profile.userId?.email || user?.email || 'N/A'}</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Date Of Birth</span>
                  <span className="text-sm font-semibold flex items-center gap-1.5 min-w-0" title={formatDate(profile.dob)}>
                    <Calendar className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="truncate">{formatDate(profile.dob)}</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Student ID</span>
                  <span className="text-sm font-semibold font-mono text-primary-600 dark:text-primary-400 truncate block" title={profile.studentId || 'N/A'}>
                    {profile.studentId || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Parents / Guardian Information */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" /> Parents & Guardian Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Father Name</span>
                  <span className="text-sm font-semibold truncate block" title={profile.fatherName || 'N/A'}>
                    {profile.fatherName || 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Father Phone No.</span>
                  <span className="text-sm font-semibold flex items-center gap-1.5 min-w-0" title={profile.fatherPhone || 'N/A'}>
                    <Phone className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="truncate">{profile.fatherPhone || 'N/A'}</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Mother Phone No.</span>
                  <span className="text-sm font-semibold flex items-center gap-1.5 min-w-0" title={profile.motherPhone || 'Not Provided'}>
                    <Phone className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="truncate">{profile.motherPhone || 'Not Provided'}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Hometown & Address */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" /> Hometown & Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Village</span>
                  <span className="text-sm font-semibold truncate block" title={profile.village || 'N/A'}>
                    {profile.village || 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Taluka</span>
                  <span className="text-sm font-semibold truncate block" title={profile.taluka || 'N/A'}>
                    {profile.taluka || 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">District</span>
                  <span className="text-sm font-semibold truncate block" title={profile.district || 'N/A'}>
                    {profile.district || 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Pin Code</span>
                  <span className="text-sm font-semibold font-mono truncate block" title={profile.pincode || 'Not Provided'}>
                    {profile.pincode || 'Not Provided'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Academic & Hostel Allocation */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center gap-2">
                <School className="w-4 h-4 text-primary-500" /> Academic & Hostel Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">School Name</span>
                  <span className="text-sm font-semibold truncate block" title={profile.school || 'N/A'}>
                    {profile.school || 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">College Name</span>
                  <span className="text-sm font-semibold truncate block" title={profile.college || 'Not Provided'}>
                    {profile.college || 'Not Provided'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Room Assignment</span>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 truncate block" title={`Room ${profile.roomNumber || 'N/A'}`}>
                    Room {profile.roomNumber || 'N/A'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/40 min-w-0 overflow-hidden">
                  <span className="text-xs text-black/50 dark:text-white/50 block mb-1 truncate">Deposit Paid</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate block" title={`₹${Number(profile.deposit || 0).toLocaleString()}`}>
                    ₹{Number(profile.deposit || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </div>

      {/* Change Request Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border"
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-black/5 dark:bg-white/5">
                <div>
                  <h3 className="text-lg font-bold">Request Profile Correction</h3>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Submit details you want admin to update</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="requestChangeText" className="text-sm font-medium mb-1.5 block">
                    Details to Update *
                  </label>
                  <textarea
                    id="requestChangeText"
                    name="requestChangeText"
                    required
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                    placeholder="E.g., Please update my phone number to 9876543210 or update my college name to Government Engineering College..."
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;
