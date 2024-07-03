import { z } from 'zod';

export enum ElementType {
	Text = 1,
	Element = 2,
}

export const $nodeId = z.number().int().gte(-1);
export const $nodeType = z.nativeEnum(ElementType);
