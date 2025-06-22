import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus } from "lucide-react";

const createClanSchema = z.object({
  name: z.string().min(3, "Clan name must be at least 3 characters").max(50, "Clan name must be less than 50 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  isPublic: z.boolean().default(true),
});

type CreateClanFormData = z.infer<typeof createClanSchema>;

export default function CreateClanForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateClanFormData>({
    resolver: zodResolver(createClanSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
    },
  });

  const createClanMutation = useMutation({
    mutationFn: async (data: CreateClanFormData) => {
      const response = await apiRequest('POST', '/api/clans', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Clan created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clans'] });
      form.reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create clan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateClanFormData) => {
    createClanMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gaming-purple hover:bg-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Clan
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gaming-card border-gaming-card-hover">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gaming-purple" />
            <span>Create New Clan</span>
          </DialogTitle>
          <DialogDescription className="text-gaming-text-dim">
            Create a clan to build your gaming community and compete together.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Clan Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter clan name..."
                      className="bg-gaming-darker border-gaming-card-hover text-white placeholder:text-gaming-text-dim"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your clan's goals and gaming style..."
                      className="bg-gaming-darker border-gaming-card-hover text-white placeholder:text-gaming-text-dim resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription className="text-gaming-text-dim">
                    Optional description to help players understand your clan.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gaming-card-hover p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white">Public Clan</FormLabel>
                    <FormDescription className="text-gaming-text-dim">
                      Allow anyone to discover and join your clan.
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

            <div className="flex justify-end space-x-3">
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
                disabled={createClanMutation.isPending}
                className="bg-gaming-purple hover:bg-purple-600"
              >
                {createClanMutation.isPending ? "Creating..." : "Create Clan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}