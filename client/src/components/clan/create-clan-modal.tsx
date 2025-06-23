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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

const createClanSchema = z.object({
  name: z.string().min(1, "Clan name is required").max(100, "Name too long"),
  tag: z.string().min(2, "Tag must be at least 2 characters").max(6, "Tag too long").regex(/^[A-Z0-9]+$/, "Tag must be uppercase letters and numbers only"),
  description: z.string().optional(),
  isPrivate: z.boolean(),
  memberLimit: z.number().min(2, "Minimum 2 members").max(100, "Maximum 100 members"),
  region: z.string().optional(),
  language: z.string(),
});

type CreateClanForm = z.infer<typeof createClanSchema>;

interface CreateClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clan: any) => void;
}

const SUPPORTED_GAMES = [
  "Valorant", "League of Legends", "CS2", "Overwatch 2", "Apex Legends",
  "Fortnite", "Rocket League", "PUBG", "Call of Duty", "Dota 2"
];

const REGIONS = [
  "North America", "Europe", "Asia Pacific", "South America", 
  "Middle East", "Africa", "Oceania"
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
];

export default function CreateClanModal({ isOpen, onClose, onSuccess }: CreateClanModalProps) {
  const [games, setGames] = useState<string[]>([]);
  const [gameInput, setGameInput] = useState("");
  const { toast } = useToast();

  const form = useForm<CreateClanForm>({
    resolver: zodResolver(createClanSchema),
    defaultValues: {
      name: "",
      tag: "",
      description: "",
      isPrivate: false,
      memberLimit: 25,
      region: "",
      language: "en",
    },
  });

  const createClanMutation = useMutation({
    mutationFn: async (data: CreateClanForm & { games: string[] }) => {
      const response = await apiRequest('POST', '/api/clans', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create clan');
      }
      return response.json();
    },
    onSuccess: (clan) => {
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
      toast({ title: "Clan created successfully!" });
      onSuccess(clan);
      onClose();
      form.reset();
      setGames([]);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create clan", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleAddGame = () => {
    if (gameInput.trim() && !games.includes(gameInput.trim()) && games.length < 5) {
      setGames([...games, gameInput.trim()]);
      setGameInput("");
    }
  };

  const handleRemoveGame = (game: string) => {
    setGames(games.filter(g => g !== game));
  };

  const onSubmit = (data: CreateClanForm) => {
    if (games.length === 0) {
      toast({
        title: "Add at least one game",
        description: "Your clan should support at least one game",
        variant: "destructive"
      });
      return;
    }

    createClanMutation.mutate({ ...data, games });
  };

  const handleClose = () => {
    if (!createClanMutation.isPending) {
      onClose();
      form.reset();
      setGames([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gaming-card border-gaming-card-hover max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create Your Clan</DialogTitle>
          <DialogDescription>
            Build your gaming community and compete together.
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
                    <FormLabel className="text-white">Clan Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Elite Gamers"
                        className="bg-gaming-darker border-gaming-card-hover text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Clan Tag</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ELITE"
                        className="bg-gaming-darker border-gaming-card-hover text-white uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        maxLength={6}
                      />
                    </FormControl>
                    <FormDescription>
                      2-6 characters, letters and numbers only
                    </FormDescription>
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
                      placeholder="Describe your clan's goals, playstyle, and what makes you unique..."
                      className="bg-gaming-darker border-gaming-card-hover text-white resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Games */}
            <div>
              <FormLabel className="text-white">Supported Games</FormLabel>
              <div className="mt-2">
                <div className="flex gap-2 mb-2">
                  <Select value={gameInput} onValueChange={setGameInput}>
                    <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                      <SelectValue placeholder="Select a game" />
                    </SelectTrigger>
                    <SelectContent className="bg-gaming-card border-gaming-card-hover">
                      {SUPPORTED_GAMES.map((game) => (
                        <SelectItem key={game} value={game}>
                          {game}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button"
                    onClick={handleAddGame}
                    disabled={!gameInput || games.includes(gameInput) || games.length >= 5}
                    size="icon"
                    className="bg-gaming-blue hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {games.map((game) => (
                    <Badge key={game} variant="outline" className="bg-gaming-darker border-gaming-card-hover text-white pr-1">
                      {game}
                      <button 
                        type="button"
                        onClick={() => handleRemoveGame(game)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {games.length === 0 && (
                  <p className="text-sm text-gaming-text-dim mt-1">Add at least one game</p>
                )}
              </div>
            </div>

            {/* Settings */}
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
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Primary Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gaming-darker border-gaming-card-hover text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gaming-card border-gaming-card-hover">
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="memberLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Member Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        min={2}
                        max={100}
                        className="bg-gaming-darker border-gaming-card-hover text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gaming-card-hover p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">
                        Private Clan
                      </FormLabel>
                      <FormDescription>
                        Require approval to join
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
                disabled={createClanMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createClanMutation.isPending || games.length === 0}
                className="flex-1 bg-gaming-blue hover:bg-blue-600"
              >
                {createClanMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Clan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}