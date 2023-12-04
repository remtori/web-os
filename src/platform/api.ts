export interface Command {
	command: string;
	description: string;
}

export interface AppInteractionApi {
	listAllCommands(): Command[];

	getCommandSource(command: string): string;
	setCommandSource(name: string, command: string): void;

	on(event: 'command-list-changed', callback: () => unknown): this;
	on(event: 'command-source-changed', callback: (command: Command, source: string) => unknown): this;
}
