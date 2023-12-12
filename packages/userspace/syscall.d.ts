declare module 'virtual:syscall' {
	import { UIMessage, UIEventMessage } from 'virtual:syscall/ui';

	export type Syscall = UIMessage;

	export type SystemMessage = UIEventMessage | ShutdownMessage;

	export type ShutdownMessage = {
		type: 'shutdown';
	};
}

declare module 'virtual:syscall/ui' {
	export enum NodeType {
		Text = 1,
		Element = 2,
	}

	export type UICreateNodeMessage = {
		type: 'ui/node/create';
		params: Array<{
			nodeId: number;
			nodeType: NodeType;
			value: string;
		}>;
	};

	export type UIRemoveNodeMessage = {
		type: 'ui/node/remove';
		params: Array<{
			parentNodeId: number;
			nodeId: number;
		}>;
	};

	export type UIInsertNodeMessage = {
		type: 'ui/node/insert';
		params: Array<{
			parentNodeId: number;
			nodeId: number;
			anchorNodeId: number;
		}>;
	};

	export type UIReplaceTextMessage = {
		type: 'ui/node/replaceText';
		params: Array<{
			nodeId: number;
			value: string;
		}>;
	};

	export type UISetPropertyMessage = {
		type: 'ui/node/setProperty';
		params: Array<{
			nodeId: number;
			name: string;
			value: any;
		}>;
	};

	export type UISubscribeEventMessage = {
		type: 'ui/event/subscribe';
		params: Array<{
			nodeId: number;
			name: string;
		}>;
	};

	export type UIUnsubscribeEventMessage = {
		type: 'ui/event/unsubscribe';
		params: Array<{
			nodeId: number;
			name: string;
		}>;
	};

	export type UIEventMessage = {
		type: 'ui/event';
		params: Array<{
			nodeId: number;
			name: string;
			data: any;
		}>;
	};

	export type UIMessage =
		| UICreateNodeMessage
		| UIRemoveNodeMessage
		| UIInsertNodeMessage
		| UIReplaceTextMessage
		| UISetPropertyMessage
		| UISubscribeEventMessage
		| UIUnsubscribeEventMessage;
}
