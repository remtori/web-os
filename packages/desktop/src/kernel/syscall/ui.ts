import { z } from 'zod';
import { router, publicProcedure } from './router';
import { $nodeId, $nodeType, ElementType } from '@kernel/schema';

const nodeRouter = router({
	create: publicProcedure
		.input(
			z.object({
				nodeId: $nodeId,
				nodeType: $nodeType,
				value: z.string(),
			})
		)
		.mutation(({ ctx, input }): void => {
			if (input.value === 'root' || input.nodeId <= 0) {
				return;
			}

			if (input.nodeType === ElementType.Text) {
				const node = document.createTextNode(input.value);
				ctx.process.addNode(input.nodeId, node);
			} else if (input.nodeType === ElementType.Element) {
				const node = document.createElement(input.value);
				ctx.process.addNode(input.nodeId, node);
			}
		}),
	remove: publicProcedure
		.input(
			z.object({
				parent: $nodeId,
				node: $nodeId,
			})
		)
		.mutation(({ ctx, input }): void => {
			const parent = ctx.process.getNode(input.parent);
			const node = ctx.process.getNode(input.node);

			if (parent && node) {
				parent.removeChild(node);
			}

			ctx.process.deleteNode(input.node);
		}),
	insert: publicProcedure
		.input(
			z.object({
				parent: $nodeId,
				node: $nodeId,
				anchor: $nodeId.optional(),
			})
		)
		.mutation(({ ctx, input }): void => {
			const parent = ctx.process.getNode(input.parent);
			const node = ctx.process.getNode(input.node);
			let anchor;
			if (input.anchor) {
				anchor = ctx.process.getNode(input.anchor);
			}

			if (parent && node) {
				parent.insertBefore(node, anchor!);
			}
		}),
	replaceText: publicProcedure
		.input(
			z.object({
				node: $nodeId,
				value: z.string(),
			})
		)
		.mutation(({ ctx, input }): void => {
			const node = ctx.process.getNode(input.node);
			if (node) {
				(node as Text).data = input.value;
			}
		}),
	setProperty: publicProcedure
		.input(
			z.object({
				node: $nodeId,
				name: z.string(),
				value: z.string(),
			})
		)
		.mutation(({ ctx, input }): void => {
			const node = ctx.process.getNode(input.node);
			if (node) {
				(node as HTMLElement).setAttribute(input.name, input.value);
			}
		}),
});

export const uiRouter = router({
	node: nodeRouter,
});
