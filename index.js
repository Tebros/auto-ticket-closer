const { Op } = require('sequelize');

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

		await this.closeTicket(t_row);
	}

	preload() {
		this.config = this.client.config[this.id];

		const handler = this.handleMessage.bind(this);
		this.client.on('message', msg => handler(msg));
	}

	async autoCloseChannels() {
		const closeDate = new Date(Date.now() - (this.config.lifetimeMins * 60000));

		const client = this.client;
		const tickets = await client.db.models.Ticket.findAndCountAll({
			where: {
				open: true,
				// eslint-disable-next-line sort-keys
				last_message: { [Op.lte]: closeDate }
			}
		});

		for (const ticket of tickets.rows) {
			await this.closeTicket(ticket);
		}
	}

	async closeTicket(ticket) {
		try {
			const defaultCloserId = this.config.closerUserId ?? null;

			await this.client.tickets.close(ticket.id, defaultCloserId, ticket.guild, 'Closed by bot');

			await ticket.update({
				closed_by: defaultCloserId,
				closed_reason: 'Closed by bot',
				open: false
			});

			this.client.log.info(`A ticket was closed (${ticket.id}) "Closed by bot"`);

			await this.deleteChannel(ticket);
		} catch (e) {
			//
		}
	}

	async deleteChannel(ticket) {
		const guild = await this.client.guilds.cache.get(ticket.guild);
		// eslint-disable-next-line eqeqeq
		if (guild == null) return;
		const channel = await guild.channels.fetch(ticket.id);
		// eslint-disable-next-line eqeqeq
		if (channel == null) return;

		try {
			await channel.send('Closed by bot');
		}catch (e){
			//
		}

		await channel.delete();
		this.client.log.info(`A ticket was deleted (${ticket.id}) "Closed by bot"`);
	}

	load() {
		const handler = this.autoCloseChannels.bind(this);
		setInterval(() => handler(), 600000);
	}
};
