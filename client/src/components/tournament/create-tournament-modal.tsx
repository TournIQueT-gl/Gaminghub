import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const createTournamentSchema = z.object({
  name: z.string().min(1, "Tournament name is required").max(100, "Name too long"),
  description: z.string().optional(),
  game: z.string().min(1, "Game is required"),
  format: z.string().min(1, "Format is required"),
  type: z.string().min(1, "Tournament type is required"),
  maxParticipants: z.number().min(2, "Minimum 2 participants").max(1000, "Maximum 1000 participants"),
  teamSize: z.number().min(1, "Team size must be at least 1"),
  prizePool: z.string().optional(),
  entryFee: z.string().optional(),
  region: z.string().optional(),
  skill_level: z.string().optional(),
  registrationEnd: z.date().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isPublic: z.boolean(),
  isFeatured: z.boolean(),
});

type CreateTournamentForm = z.infer<typeof createTournamentSchema>;

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tournament: any) => void;
}

const SUPPORTED_GAMES = [
  "Valorant", "League of Legends", "CS2", "Overwatch 2", "Apex Legends",
  "Fortnite", "Rocket League", "PUBG", "Call of Duty", "Dota 2", "FIFA", "Tekken 8"
];

const TOURNAMENT_FORMATS = [
  { value: "solo", label: "Solo" },
  { value: "team", label: "Team" },
  { value: "clan", label: "Clan vs Clan" },
];

const TOURNAMENT_TYPES = [
  { value: "single-elimination", label: "Single Elimination" },
  { value: "double-elimination", label: "Double Elimination" },
  { value: "round-robin", label: "Round Robin" },
  { value: "swiss", label: "Swiss System" },
];

const REGIONS = [
  "North America", "Europe", "Asia Pacific", "South America", 
  "Middle East", "Africa", "Oceania"
];

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
];

export default function CreateTournamentModal({ isOpen, onClose, onSuccess }: CreateTournamentModalProps) {
  const { toast } = useToast();

  const form = useForm<CreateTournamentForm>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      name: "",
      description: "",
      game: "",
      format: "solo",
      type: "single-elimination",
      maxParticipants: 16,
      teamSize: 1,
      prizePool: "",
      entryFee: "0",
      region: "",
      skill_level: "intermediate",
      isPublic: true,
      isFeatured: false,
    },
  });

  const format_value = form.watch("format");

  const createTournamentMutation = useMutation({
    mutationFn: async (data: CreateTournamentForm) => {
      const response = await apiRequest('POST', '/api/tournaments', {
        ...data,
        registrationEnd: data.registrationEnd?.toISOString(),
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create tournament');
      }
      return response.json();
    },
    onSuccess: (tournament) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({ title: "Tournament created successfully!" });
      onSuccess(tournament);
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create tournament", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: CreateTournamentForm) => {
    createTournamentMutation.mutate(data);
  };

  const handleClose = () => {
    if (!createTournamentMutation.isPending) {
      onClose();
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gaming-card border-gaming-card-hover max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create Tournament</DialogTitle>
          <DialogDescription>
            Organize a competitive gaming tournament for your community.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tournament Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Spring Championship"
                        className="bg-gaming-darker border-gaming-card-hover text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="game"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Game</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                          <SelectValue placeholder="Select game" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gaming-card border-gaming-card-hover">
                        {SUPPORTED_GAMES.map((game) => (
                          <SelectItem key={game} value={game}>
                            {game}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the tournament format, rules, and what participants can expect..."
                      className="bg-gaming-darker border-gaming-card-hover text-white resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tournament Settings */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gaming-card border-gaming-card-hover">
                        {TOURNAMENT_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tournament Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gaming-card border-gaming-card-hover">
                        {TOURNAMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Participants and Team Size */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Max Participants</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        min={2}
                        max={1000}
                        className="bg-gaming-darker border-gaming-card-hover text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {format_value !== "solo" && (
                <FormField
                  control={form.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Team Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          min={1}
                          max={20}
                          className="bg-gaming-darker border-gaming-card-hover text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Prize and Entry Fee */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prizePool"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Prize Pool ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="0"
                        min={0}
                        step="0.01"
                        className="bg-gaming-darker border-gaming-card-hover text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Entry Fee ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="0"
                        min={0}
                        step="0.01"
                        className="bg-gaming-darker border-gaming-card-hover text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Region and Skill Level */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gaming-card border-gaming-card-hover">
                        {REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skill_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Skill Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gaming-card border-gaming-card-hover">
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="registrationEnd"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">Registration Ends</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "bg-gaming-darker border-gaming-card-hover text-white pl-3 text-left font-normal",
                              !field.value && "text-gaming-text-dim"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gaming-card border-gaming-card-hover" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "bg-gaming-darker border-gaming-card-hover text-white pl-3 text-left font-normal",
                              !field.value && "text-gaming-text-dim"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gaming-card border-gaming-card-hover" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "bg-gaming-darker border-gaming-card-hover text-white pl-3 text-left font-normal",
                              !field.value && "text-gaming-text-dim"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gaming-card border-gaming-card-hover" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gaming-card-hover p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">
                        Public Tournament
                      </FormLabel>
                      <FormDescription>
                        Allow anyone to discover and join this tournament
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gaming-card-hover p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">
                        Featured Tournament
                      </FormLabel>
                      <FormDescription>
                        Highlight this tournament to attract more participants
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createTournamentMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTournamentMutation.isPending}
                className="flex-1 bg-gaming-blue hover:bg-blue-600"
              >
                {createTournamentMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Tournament"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}