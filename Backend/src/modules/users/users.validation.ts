import { z } from 'zod'

const stringArray = z.array(z.string().trim().min(1)).max(100)

const entrepreneurProfileSchema = z
  .object({
    bio: z.string().trim().max(2000).optional(),
    startupName: z.string().trim().max(200).optional(),
    industry: z.string().trim().max(200).optional(),
    pitchDescription: z.string().trim().max(5000).optional(),
    fundingStage: z.string().trim().max(100).optional(),
    location: z.string().trim().max(200).optional(),
    socialLinks: z.record(z.string().trim().max(500)).optional(),
    startupHistory: stringArray.optional(),
    preferences: z.record(z.unknown()).optional(),
  })
  .strict()

const investorProfileSchema = z
  .object({
    bio: z.string().trim().max(2000).optional(),
    investmentFocus: z.string().trim().max(500).optional(),
    preferredIndustries: z.array(z.string().trim().min(1)).max(50).optional(),
    investmentRange: z
      .object({
        min: z.number().nonnegative().optional(),
        max: z.number().nonnegative().optional(),
      })
      .strict()
      .optional(),
    portfolioCompanies: z.array(z.string().trim().min(1)).max(200).optional(),
    investmentHistory: stringArray.optional(),
    preferences: z.record(z.unknown()).optional(),
  })
  .strict()

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional(),
    bio: z.string().trim().max(2000).optional(),
    entrepreneurProfile: entrepreneurProfileSchema.optional(),
    investorProfile: investorProfileSchema.optional(),
    preferences: z.record(z.unknown()).optional(),
  })
  .strict()
