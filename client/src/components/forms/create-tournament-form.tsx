import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus } from "lucide-react";

const createTournamentSchema = z.object({
  name: z.string().min(3, "Tournament name must be at least 3 characters").max(100, "Tournament name must be less than 100 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  game: z.string().min(1, "Please select a game"),
  format: z.enum(["solo", "team"], { required_error: "Please select a format" }),
  maxParticipants: z.number().min(4, "Minimum 4 participants").max(256, "Maximum 256 participants"),
  prizePool: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
});

type CreateTournamentFormData = z.infer<typeof createTournamentSchema>;

const gameOptions = [
  "League of Legends",
  "Counter-Strike 2",
  "Valorant",
  "Dota 2",
  "Overwatch 2",
  "Apex Legends",
  "Fortnite",
  "Rocket League",
  "Call of Duty",
  "Starcraft II",
];

export default function CreateTournamentForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateTournamentFormData>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      name: "",
      description: "",
      game: "",
      format: "solo",
      maxParticipants: 16,
      prizePool: "",
      startDate: "",
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: CreateTournamentFormData) => {
      const response = await apiRequest('POST', '/api/tournaments', {
        ...data,
        maxParticipants: Number(data.maxParticipants),
        startDate: new Date(data.startDate).toISOString(),
        prizePool: data.prizePool || null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tournament created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      form.reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTournamentFormData) => {
    createTournamentMutation.mutate(data);
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gaming-emerald hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gaming-card border-gaming-card-hover max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-gaming-emerald" />
            <span>Create Tournament</span>
          </DialogTitle>
          <DialogDescription className="text-gaming-text-dim">
            Organize a competitive tournament for the gaming community.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tournament Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter tournament name..."
                      className="bg-gaming-darker border-gaming-card-hover text-white placeholder:text-gaming-text-dim"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                      <SelectContent className="bg-gaming-darker border-gaming-card-hover">
                        {gameOptions.map((game) => (
                          <SelectItem key={game} value={game} className="text-white hover:bg-gaming-card">
                            {game}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gaming-darker border-gaming-card-hover">
                        <SelectItem value="solo" className="text-white hover:bg-gaming-card">Solo</SelectItem>
                        <SelectItem value="team" className="text-white hover:bg-gaming-card">Team</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Max Players</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={4}
                        max={256}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gaming-darker border-gaming-card-hover text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={minDateString}
                        {...field}
                        className="bg-gaming-darker border-gaming-card-hover text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="prizePool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Prize Pool (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., $500, 1000 XP, Gaming Gear"
                      className="bg-gaming-darker border-gaming-card-hover text-white placeholder:text-gaming-text-dim"
                    />
                  </FormControl>
                  <FormDescription className="text-gaming-text-dim text-xs">
                    Describe the prizes or leave empty for glory only.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tournament rules, format details, requirements..."
                      className="bg-gaming-darker border-gaming-card-hover text-white placeholder:text-gaming-text-dim resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gaming-card-hover hover:bg-gaming-card-hover"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTournamentMutation.isPending}
                className="bg-gaming-emerald hover:bg-emerald-600"
              >
                {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}