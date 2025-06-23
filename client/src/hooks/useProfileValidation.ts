import { useState, useCallback } from "react";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
  location: z.string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  website: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  favoriteGames: z.array(z.string())
    .max(10, "You can only have up to 10 favorite games")
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface ValidationError {
  field: string;
  message: string;
}

export function useProfileValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateProfile = useCallback(async (data: Partial<ProfileFormData>): Promise<boolean> => {
    setIsValidating(true);
    setErrors([]);

    try {
      // Clean data before validation
      const cleanData = {
        ...data,
        username: data.username?.trim(),
        bio: data.bio?.trim(),
        location: data.location?.trim(),
        website: data.website?.trim() || undefined,
      };

      await profileSchema.parseAsync(cleanData);
      setIsValidating(false);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        setErrors(validationErrors);
      } else {
        setErrors([{ field: 'general', message: 'An unexpected error occurred' }]);
      }
      setIsValidating(false);
      return false;
    }
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  return {
    errors,
    isValidating,
    validateProfile,
    getFieldError,
    clearErrors,
    clearFieldError,
  };
}