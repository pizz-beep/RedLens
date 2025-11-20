import { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, AlertTriangle, Calendar, Clock, User, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';

interface ReportCrimeFormProps {
  onBack: () => void;
  onSubmit: () => void;
  userName: string;
  userId: string;
}

interface CrimeCategory {
  CategoryID: number;
  CategoryName: string;
  Description: string;
}

interface Location {
  LocationID: number;
  AreaName: string;
  Address: string;
  Latitude: number;
  Longitude: number;
}

interface CrimeType {
  CrimeType: string;
}

export function ReportCrimeForm({ onBack, onSubmit, userName, userId }: ReportCrimeFormProps) {
  const [categoryId, setCategoryId] = useState('');
  const [crimeType, setCrimeType] = useState('');
  const [locationId, setLocationId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data from backend
  const [categories, setCategories] = useState<CrimeCategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [crimeTypes, setCrimeTypes] = useState<CrimeType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Fetch crime categories and locations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching form data...");
        
        const [categoriesRes, locationsRes] = await Promise.all([
          fetch("http://localhost:4000/api/crime-categories"),
          fetch("http://localhost:4000/api/locations")
        ]);
        
        console.log("📡 Response status - Categories:", categoriesRes.status, "Locations:", locationsRes.status);
        
        if (!categoriesRes.ok || !locationsRes.ok) {
          throw new Error("Failed to fetch data from server");
        }
        
        const categoriesData = await categoriesRes.json();
        const locationsData = await locationsRes.json();
        
        console.log("📦 Raw categories data:", categoriesData);
        console.log("📦 Raw locations data:", locationsData);
        console.log("📦 Locations is array?", Array.isArray(locationsData));
        console.log("📦 Locations length:", locationsData?.length);
        
        // Filter out any invalid data
        const validCategories = Array.isArray(categoriesData) 
          ? categoriesData.filter(c => c.CategoryID && c.CategoryName)
          : [];
        const validLocations = Array.isArray(locationsData) 
          ? locationsData.filter(l => {
              console.log("🔍 Checking location:", l);
              return l.LocationID && l.AreaName;
            })
          : [];
        
        console.log("✅ Valid categories:", validCategories.length, validCategories);
        console.log("✅ Valid locations:", validLocations.length, validLocations);
        
        setCategories(validCategories);
        setLocations(validLocations);
        
        if (validCategories.length === 0) {
          toast.error("No crime categories available");
        }
        if (validLocations.length === 0) {
          toast.error("No locations available");
        }
      } catch (error) {
        console.error("❌ Error fetching form data:", error);
        toast.error("Failed to load form data. Please check your connection.");
      }
    };
    
    fetchData();
  }, []);

  // Fetch crime types when category changes
  useEffect(() => {
    if (categoryId) {
      const fetchCrimeTypes = async () => {
        setLoadingTypes(true);
        try {
          const response = await fetch(`http://localhost:4000/api/crime-types/${categoryId}`);
          const data = await response.json();
          setCrimeTypes(data);
          console.log("🔖 Loaded crime types for category:", categoryId, data);
        } catch (error) {
          console.error("Error fetching crime types:", error);
          setCrimeTypes([]);
        } finally {
          setLoadingTypes(false);
        }
      };
      
      fetchCrimeTypes();
      // Reset crime type when category changes
      setCrimeType('');
    }
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationId) {
      toast.error("Please select a location");
      return;
    }
    
    if (!categoryId) {
      toast.error("Please select a crime category");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("🚀 Submitting crime report:", {
        crimeType,
        categoryId: parseInt(categoryId),
        severity,
        description,
        incidentDate: date,
        incidentTime: time,
        userId,
        locationId: parseInt(locationId),
      });

      const response = await fetch("http://localhost:4000/api/citizen-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crimeType,
          categoryId: parseInt(categoryId),
          severity,
          description,
          incidentDate: date,
          incidentTime: time,
          userId,
          locationId: parseInt(locationId),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Crime report submitted successfully! It will be reviewed by administrators.");
        console.log("✅ Report submitted with ID:", result.reportId);
        onSubmit();
      } else {
        toast.error(result.error || "Failed to submit report");
        console.error("❌ Submission failed:", result);
      }
    } catch (error) {
      console.error("❌ Error submitting crime report:", error);
      toast.error("Failed to submit crime report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLocation = locations.find(loc => loc.LocationID === parseInt(locationId));

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

            {/* Crime Category (from database) */}
            <div className="space-y-2">
              <Label htmlFor="crime-category" className="text-zinc-300">
                Crime Category *
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select crime category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem 
                        key={category.CategoryID} 
                        value={category.CategoryID.toString()}
                      >
                        {category.CategoryName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {categoryId && (
                <p className="text-xs text-zinc-500">
                  {categories.find(c => c.CategoryID === parseInt(categoryId))?.Description}
                </p>
              )}
            </div>

            {/* Crime Type (specific description) */}
            <div className="space-y-2">
              <Label htmlFor="crime-type" className="text-zinc-300">
                Specific Crime Type *
              </Label>
              {categoryId ? (
                crimeTypes.length > 0 ? (
                  <Select value={crimeType} onValueChange={setCrimeType} required disabled={loadingTypes}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500">
                      <SelectValue placeholder={loadingTypes ? "Loading types..." : "Select crime type"} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60">
                      {crimeTypes.map((type, index) => (
                        <SelectItem 
                          key={index} 
                          value={type.CrimeType}
                        >
                          {type.CrimeType}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="crime-type"
                    type="text"
                    placeholder="e.g., Vehicle Theft, House Burglary, Street Robbery"
                    value={crimeType}
                    onChange={(e) => setCrimeType(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-500"
                    required
                  />
                )
              ) : (
                <Input
                  disabled
                  placeholder="Select a category first"
                  className="bg-zinc-800 border-zinc-700 text-zinc-500"
                />
              )}
              <p className="text-xs text-zinc-500">
                Provide specific details about the type of crime
              </p>
            </div>

            {/* Location (from database) */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-300">
                Location Area * ({locations.length} available)
              </Label>
              <Select value={locationId} onValueChange={setLocationId} required>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select location area" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-60">
                  {locations.length > 0 ? (
                    locations.map((loc) => {
                      console.log("🗺️ Rendering location option:", loc.LocationID, loc.AreaName);
                      return (
                        <SelectItem 
                          key={loc.LocationID} 
                          value={loc.LocationID?.toString() || ''}
                        >
                          {loc.AreaName}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="loading" disabled>
                      {locations.length === 0 ? "No locations available" : "Loading locations..."}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedLocation && selectedLocation.Address && (
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedLocation.Address}
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-zinc-300">
                  Incident Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500 pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-zinc-300">
                  Incident Time *
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
                  <SelectItem value="Low">Low - Minor incident</SelectItem>
                  <SelectItem value="Medium">Medium - Moderate concern</SelectItem>
                  <SelectItem value="High">High - Serious incident</SelectItem>
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