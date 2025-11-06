import { useState } from 'react';
import { ChevronLeft, MapPin, AlertTriangle, Calendar, Clock, User, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface ReportCrimeFormProps {
  onBack: () => void;
  onSubmit: () => void;
  userName: string;
  userId: string;
}

export function ReportCrimeForm({ onBack, onSubmit, userName, userId }: ReportCrimeFormProps) {
  const [crimeType, setCrimeType] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');
  const [witnesses, setWitnesses] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Crime report submitted:', {
        crimeType,
        location,
        address,
        date,
        time,
        severity,
        description,
        witnesses,
        reportedBy: userName,
        reportedById: userId,
        status: 'pending'
      });
      setIsSubmitting(false);
      onSubmit();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="hover:bg-zinc-800 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white">Report Crime</h1>
              <p className="text-xs text-zinc-500">Submit a new incident report</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info Card */}
            <Card className="bg-blue-600/10 border-blue-600/20 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-400">
                    Your report will be reviewed by administrators before being verified and added to the public database.
                  </p>
                </div>
              </div>
            </Card>

            {/* Crime Type */}
            <div className="space-y-2">
              <Label htmlFor="crime-type" className="text-zinc-300">
                Crime Type *
              </Label>
              <Select value={crimeType} onValueChange={setCrimeType} required>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select crime type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Vandalism">Vandalism</SelectItem>
                  <SelectItem value="Assault">Assault</SelectItem>
                  <SelectItem value="Burglary">Burglary</SelectItem>
                  <SelectItem value="Car Theft">Car Theft</SelectItem>
                  <SelectItem value="Shoplifting">Shoplifting</SelectItem>
                  <SelectItem value="Robbery">Robbery</SelectItem>
                  <SelectItem value="Arson">Arson</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-300">
                Location Area *
              </Label>
              <Select value={location} onValueChange={setLocation} required>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select location area" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="Downtown Plaza">Downtown Plaza</SelectItem>
                  <SelectItem value="Central Park">Central Park</SelectItem>
                  <SelectItem value="Riverside District">Riverside District</SelectItem>
                  <SelectItem value="Shopping District">Shopping District</SelectItem>
                  <SelectItem value="Business District">Business District</SelectItem>
                  <SelectItem value="Residential Area">Residential Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-zinc-300">
                Street Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="address"
                  type="text"
                  placeholder="e.g., 123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-500 pl-10"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Provide a specific address if known (optional)
              </p>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-zinc-300">
                  Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500 pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-zinc-300">
                  Time *
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500 pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity" className="text-zinc-300">
                Severity Level *
              </Label>
              <Select value={severity} onValueChange={(value) => setSeverity(value as any)} required>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="low">Low - Minor incident</SelectItem>
                  <SelectItem value="medium">Medium - Moderate concern</SelectItem>
                  <SelectItem value="high">High - Serious incident</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about the incident..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-500 min-h-32"
                required
              />
              <p className="text-xs text-zinc-500">
                Include as many details as possible (what happened, who was involved, etc.)
              </p>
            </div>

            {/* Witnesses */}
            <div className="space-y-2">
              <Label htmlFor="witnesses" className="text-zinc-300">
                Number of Witnesses
              </Label>
              <Input
                id="witnesses"
                type="number"
                min="0"
                value={witnesses}
                onChange={(e) => setWitnesses(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500"
              />
            </div>

            {/* Reporter Info */}
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <h3 className="text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-red-500" />
                Reporter Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Name:</span>
                  <span className="text-white">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">User ID:</span>
                  <span className="text-white">{userId}</span>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
