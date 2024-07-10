import { z } from 'zod';

export const EmptyEpsilonState = z.object({
	general: z.object({
		shipHull: z.number(),
		alertLevel: z.string(),
		shipEnergy: z.number(),
		shipHullMax: z.number(),
		shipRearShield: z.number(),
		shipFrontShield: z.number(),
		shipHullPercent: z.number(),
	}),
	systems: z.object({
		heat: z.object({
			warpHeat: z.number(),
			impulseHeat: z.number(),
			reactorHeat: z.number(),
			maneuverHeat: z.number(),
			jumpdriveHeat: z.number(),
			rearshieldHeat: z.number(),
			beamweaponsHeat: z.number(),
			frontshieldHeat: z.number(),
			missilesystemHeat: z.number(),
		}),
		health: z.object({
			warpHealth: z.number(),
			impulseHealth: z.number(),
			reactorHealth: z.number(),
			maneuverHealth: z.number(),
			jumpdriveHealth: z.number(),
			rearshieldHealth: z.number(),
			beamweaponsHealth: z.number(),
			frontshieldHealth: z.number(),
			missilesystemHealth: z.number(),
		}),
	}),
	weapons: z.object({
		empCount: z.number(),
		hvliCount: z.number(),
		mineCount: z.number(),
		nukeCount: z.number(),
		homingCount: z.number(),
	}),
	landingPads: z.object({
		landingPadStatus1: z.number(),
		landingPadStatus2: z.number(),
		landingPadStatus3: z.number(),
		landingPadStatus4: z.number(),
	}),
});

export type EmptyEpsilonState = z.infer<typeof EmptyEpsilonState>;

export const EmptyEpsilonErrorState = z.object({
	error: z.string(),
});

export type EmptyEpsilonErrorState = z.infer<typeof EmptyEpsilonErrorState>;
