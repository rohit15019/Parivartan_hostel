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
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                      <Input defaultValue={profile.name} className="pl-10" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                      <Input defaultValue={user?.email} className="pl-10" disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                      <Input defaultValue={profile.phone} className="pl-10" disabled />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 dark:text-white/50 mb-4">Academic Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">College</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                        <Input defaultValue={profile.college} className="pl-10" disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Course & Year</label>
                      <Input defaultValue={`${profile.course} - ${profile.year}`} disabled />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 dark:text-white/50 mb-4">Guardian Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Parent/Guardian Name</label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                        <Input defaultValue={profile.parentName} className="pl-10" disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Parent Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                        <Input defaultValue={profile.parentPhone} className="pl-10" disabled />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" type="button">Cancel</Button>
                  <Button type="button" onClick={() => alert('Change request sent to admin for approval.')}>Change Request</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile;
