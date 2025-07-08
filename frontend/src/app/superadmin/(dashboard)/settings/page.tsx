'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Camera, Edit2, Save } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { apiService } from '@/lib/api';
import { toast } from 'react-toastify';
import Image from 'next/image';
interface SuperadminProfile {
  _id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SuperadminSettings() {
  const [activeTab, setActiveTab] = useState<'account' | 'password'>('account');
  const [profile, setProfile] = useState<SuperadminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
  });
  const [profileErrors, setProfileErrors] = useState<Partial<ProfileFormData>>({});

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordFormData>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuperadminProfile();
      setProfile(response.superadmin);
      setProfileForm({
        name: response.superadmin.name,
        email: response.superadmin.email,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      const response = await apiService.updateSuperadminProfilePhoto(file);
      setProfile(response.superadmin);
      toast.success('Profile photo updated successfully', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Partial<ProfileFormData> = {};
    if (!profileForm.name.trim()) errors.name = 'Name is required';
    if (!profileForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profileForm.email)) errors.email = 'Invalid email format';

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    try {
      setUpdating(true);
      setProfileErrors({});
      
      const response = await apiService.updateSuperadminProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });
      
      setProfile(response.superadmin);
      toast.success('Profile updated successfully', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Partial<PasswordFormData> = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else {
      // Enhanced password validation
      if (passwordForm.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])/.test(passwordForm.newPassword)) {
        errors.newPassword = 'Password must contain at least one lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(passwordForm.newPassword)) {
        errors.newPassword = 'Password must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(passwordForm.newPassword)) {
        errors.newPassword = 'Password must contain at least one number';
      } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(passwordForm.newPassword)) {
        errors.newPassword = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
      }
    }
    if (!passwordForm.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setUpdating(true);
      setPasswordErrors({});
      
      await apiService.changeSuperadminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile and security settings</p>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Side - Profile Section (30%) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            {/* Profile Photo */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mx-auto">
                  {profile?.profilePhoto ? (
                    <Image
                      src={apiService.getSuperadminProfilePhotoUrl(profile.profilePhoto)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      width={128}
                      height={128}
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              
              {/* Profile Info */}
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900">{profile?.name}</h3>
                <p className="text-gray-600 mt-1">{profile?.email}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Member since</span>
                    <br />
                    {new Date(profile?.createdAt || '').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {uploadingPhoto && (
                  <p className="text-sm text-indigo-600 mt-3 animate-pulse">
                    Uploading photo...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Settings Tabs (70%) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'account'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Account Details
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'password'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Change Password
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'account' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                    <p className="text-gray-600 text-sm mt-1">Update your account details and information</p>
                  </div>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-lg">
                    <Input
                      label="Full Name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      error={profileErrors.name}
                      required
                      leftIcon={<User className="w-4 h-4" />}
                      className="w-full"
                    />
                    
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      error={profileErrors.email}
                      required
                      leftIcon={<Edit2 className="w-4 h-4" />}
                      className="w-full"
                    />

                    <div className="pt-4">
                      <Button
                        type="submit"
                        loading={updating}
                        leftIcon={<Save className="w-4 h-4" />}
                        disabled={updating}
                        className="w-full sm:w-auto"
                      >
                        {updating ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                    <p className="text-gray-600 text-sm mt-1">Update your password to keep your account secure</p>
                  </div>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      error={passwordErrors.currentPassword}
                      required
                      leftIcon={<Lock className="w-4 h-4" />}
                      className="w-full"
                    />
                    
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      error={passwordErrors.newPassword}
                      required
                      leftIcon={<Lock className="w-4 h-4" />}
                      helperText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                      className="w-full"
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      error={passwordErrors.confirmPassword}
                      required
                      leftIcon={<Lock className="w-4 h-4" />}
                      className="w-full"
                    />

                    <div className="pt-4">
                      <Button
                        type="submit"
                        loading={updating}
                        leftIcon={<Save className="w-4 h-4" />}
                        disabled={updating}
                        className="w-full sm:w-auto"
                      >
                        {updating ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
