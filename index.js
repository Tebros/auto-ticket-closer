module.exports = Plugin => class AutoCloserPlugin extends Plugin {
	constructor(client, id) {
		super(client, id, {
			commands: [],
			name: 'Auto Ticket Closer'
		});
	}

	async handleMessage(message) {
		if (!message.guild) return;
		if (!message.author.bot) return;
		if (message.content !== '/close') return;

		const t_row = await this.client.db.models.Ticket.findOne({ where: { id: message.channel.id } });
		if (!t_row) return;

		this.client.tickets.close(t_row.id, message.member.id, message.guild.id, 'Closed by bot');
	}

	preload() {
		const handler = this.handleMessage.bind(this);
		this.client.ws.on('messageCreate', (...data) => handler(...data));
	}

	load() {
		setInterval(() => {
			const closeDate = new Date(Date.now() - (this.config.lifetimeMins * 60000));
			const defaultCloserId = this.config.closerUserId;

			this.client.db.models.Ticket.findMany({
				where: {
					open: 1,
					updatedAt: { lt: closeDate }
				}
			}).then(tickets => {
				tickets.forEach(ticket => {
					this.client.tickets.close(ticket.id, defaultCloserId, ticket.guild, 'Auto closed by bot');
				});
			});
		}, 1000);
	}
};
