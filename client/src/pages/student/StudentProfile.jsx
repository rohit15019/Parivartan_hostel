import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, GraduationCap, MapPin, Calendar, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [requestText, setRequestText] = useState('');

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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/profile-requests', { requestText });
      alert('Change request sent to admin for approval.');
      setShowModal(false);
      setRequestText('');
    } catch (error) {
      console.error('Failed to submit request', error);
      alert('Failed to send request');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-black/60 dark:text-white/60">View and update your personal information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
          <Card className="text-center overflow-hidden">
            <div className="h-24 bg-primary-600 dark:bg-primary-900 w-full"></div>
            <CardContent className="px-6 pb-6 pt-0 relative">
              <div className="w-24 h-24 mx-auto bg-white dark:bg-black rounded-full p-1 -mt-12 mb-4 relative z-10 border-4 border-card">
                 <div className="w-full h-full bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-3xl font-bold text-primary-700 dark:text-primary-300">
                    {(profile.name || user?.email || 'U').charAt(0)}
                 </div>
              </div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-black/50 dark:text-white/50 text-sm mb-4">{profile.studentId}</p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-black/60 dark:text-white/60 mb-1">
                <MapPin className="w-4 h-4" /> Room {profile.roomNumber}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-black/60 dark:text-white/60">
                <Calendar className="w-4 h-4" /> Joined {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="profileFullName" className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                      <Input id="profileFullName" name="profileFullName" defaultValue={profile.name} className="pl-10" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="profileEmail" className="text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                      <Input id="profileEmail" name="profileEmail" defaultValue={user?.email} className="pl-10" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="profilePhone" className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                      <Input id="profilePhone" name="profilePhone" defaultValue={profile.phone} className="pl-10" disabled />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 dark:text-white/50 mb-4">Academic Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="profileCollege" className="text-sm font-medium">College</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                        <Input id="profileCollege" name="profileCollege" defaultValue={profile.college} className="pl-10" disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profileCourseYear" className="text-sm font-medium">Course & Year</label>
                      <Input id="profileCourseYear" name="profileCourseYear" defaultValue={`${profile.course} - ${profile.year}`} disabled />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 dark:text-white/50 mb-4">Guardian Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="profileParentName" className="text-sm font-medium">Parent/Guardian Name</label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                        <Input id="profileParentName" name="profileParentName" defaultValue={profile.parentName} className="pl-10" disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profileParentPhone" className="text-sm font-medium">Parent Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                        <Input id="profileParentPhone" name="profileParentPhone" defaultValue={profile.parentPhone} className="pl-10" disabled />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" onClick={() => setShowModal(true)}>Change Details Request</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle>Request Data Change</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label htmlFor="requestChangeText" className="text-sm font-medium mb-1 block">What details do you need changed?</label>
                  <textarea
                    id="requestChangeText"
                    name="requestChangeText"
                    required
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                    placeholder="E.g. Please update my phone number to 9876543210"
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit">Send Request</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
