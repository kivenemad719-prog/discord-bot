require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const fs = require("fs");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

//////////////////////////////
// CONFIG
//////////////////////////////

const TOKEN = process.env.TOKEN;

const GUILD_ID = "1465609781837303873";

const PANEL_CHANNEL_ID = "1465757986684403828";
const INTERVIEW_PANEL_CHANNEL_ID = "PUT_INTERVIEW_PANEL_CHANNEL_ID";

const CONTROL_CHANNEL_ID = "1480098674578034698";

const ADMIN_ROLE_IDS = [
    "1494041543630131360",
    "1465798793772666941",
    "1467593770898948158",
    "1490793455952199870",
    "1465764192173686962"
];

const SUPPORT_CATEGORY_ID = "1473850568811221194";
const APPEAL_CATEGORY_ID = "1477765907496308897";
const REPORT_CATEGORY_ID = "1473843823607021579";
const SUGGESTION_CATEGORY_ID = "1477766632817426675";
const INTERVIEW_CATEGORY_ID = "PUT_INTERVIEW_CATEGORY_ID";

const RATING_CHANNEL_ID = "1480098551248715896";

const PANEL_IMAGE = "https://cdn.discordapp.com/attachments/1475033418336174141/1506739035542917170/C446B58E-B905-485B-B9D8-718604B1ABB6.png?ex=6a0f5b93&is=6a0e0a13&hm=37941ec9523a75275eb8138634139d5b897fc6d782895492234b89e34d7ca769&
const INTERVIEW_PANEL_IMAGE = "https://cdn.discordapp.com/attachments/1475033418336174141/1506744310870310973/A64899C3-A339-4DEB-AD42-E867A54438F3.png?ex=6a0f607d&is=6a0e0efd&hm=7c54af88c88a060a6018b88e7c07929d575c5877591f9b15131d8e9189e82ab1&";

const TICKET_IMAGES = {
    support: "https://cdn.discordapp.com/attachments/1475033418336174141/1506740627101188326/084F09C3-43D1-4BAA-BA81-07046757519F.png?ex=6a0f5d0f&is=6a0e0b8f&hm=7734e465ddbdd2170bd95f010b589bd5af5e862940fe92d323def9d2be999867&",
    appeal: "https://cdn.discordapp.com/attachments/1475033418336174141/1506741763845521502/03DF0538-D989-45D8-BD8D-B2A02895AEAA.png?ex=6a0f5e1e&is=6a0e0c9e&hm=93c422c6837eb6347c4b75c19f4919037e00d9165ee8729d9eb628dc5cab2f28&",
    report: "https://cdn.discordapp.com/attachments/1475033418336174141/1506740667072643153/FE2EE4A5-17C9-478E-8DAC-3F5C818777E2.png?ex=6a0f5d18&is=6a0e0b98&hm=c68a47a49812d7f6fa788026593fda6a4400d44de6535bb42dac01d608617050&",
    suggestion: "https://cdn.discordapp.com/attachments/1475033418336174141/1506742304839569658/DBE5E889-4799-4DC5-B28A-B54CE6A5017F.png?ex=6a0f5e9f&is=6a0e0d1f&hm=8828df894c9bd816e67073cdc084989cd04bd22dec32649490f84bed06542c20&",
    interview: "https://cdn.discordapp.com/attachments/1475033418336174141/1506743480234279003/38DDBB12-3A2C-427E-93C8-8E9DBF929AB7.png?ex=6a0f5fb7&is=6a0e0e37&hm=8997ed08361beb24738fdfc474b492248c646c0f2feb2bdf5d43baa434f25107&"
};

//////////////////////////////

const ratingsFile = "./ratings.json";
const controlFile = "./control.json";
const counterFile = "./ticketCounter.json";
const activityFile = "./ticketActivity.json";

if (!fs.existsSync(ratingsFile)) fs.writeFileSync(ratingsFile, "{}");

if (!fs.existsSync(counterFile)) {
    fs.writeFileSync(counterFile, JSON.stringify({ count: 0 }, null, 2));
}

if (!fs.existsSync(activityFile)) {
    fs.writeFileSync(activityFile, "{}");
}

if (!fs.existsSync(controlFile)) {
    fs.writeFileSync(controlFile, JSON.stringify({
        support: false,
        appeal: false,
        report: false,
        suggestion: false,
        interview: false
    }, null, 2));
}

function loadRatings() {
    return JSON.parse(fs.readFileSync(ratingsFile));
}

function saveRatings(data) {
    fs.writeFileSync(ratingsFile, JSON.stringify(data, null, 2));
}

function loadControl() {
    return JSON.parse(fs.readFileSync(controlFile));
}

function saveControl(data) {
    fs.writeFileSync(controlFile, JSON.stringify(data, null, 2));
}

function loadCounter() {
    return JSON.parse(fs.readFileSync(counterFile));
}

function saveCounter(data) {
    fs.writeFileSync(counterFile, JSON.stringify(data, null, 2));
}

function loadActivity() {
    return JSON.parse(fs.readFileSync(activityFile));
}

function saveActivity(data) {
    fs.writeFileSync(activityFile, JSON.stringify(data, null, 2));
}

function hasAdminRole(member) {
    return ADMIN_ROLE_IDS.some(role => member.roles.cache.has(role));
}

function getTicketNumber() {
    const counter = loadCounter();
    counter.count += 1;
    saveCounter(counter);
    return String(counter.count).padStart(3, "0");
}

const ticketTypes = {
    support: {
        name: "الدعم الفني",
        emoji: "🛠️",
        category: SUPPORT_CATEGORY_ID,
        image: TICKET_IMAGES.support,
        message: "يرجى شرح المشكلة بالكامل مع إرسال الصور أو المقاطع إن وجدت حتى يتمكن فريق الدعم من مساعدتك بأسرع وقت ممكن."
    },

    appeal: {
        name: "استئناف",
        emoji: "📨",
        category: APPEAL_CATEGORY_ID,
        image: TICKET_IMAGES.appeal,
        message: "يرجى كتابة سبب الاستئناف بالكامل مع توضيح جميع التفاصيل الخاصة بالحالة الخاصة بك."
    },

    report: {
        name: "شكوى لاعب",
        emoji: "🚨",
        category: REPORT_CATEGORY_ID,
        image: TICKET_IMAGES.report,
        message: "يرجى كتابة اسم اللاعب وشرح الشكوى بالكامل مع إرسال الأدلة المتوفرة."
    },

    suggestion: {
        name: "اقتراح",
        emoji: "💡",
        category: SUGGESTION_CATEGORY_ID,
        image: TICKET_IMAGES.suggestion,
        message: "يرجى كتابة اقتراحك بالكامل مع توضيح الفكرة وطريقة تنفيذها داخل السيرفر."
    },

    interview: {
        name: "مقابلة فورية",
        emoji: "🎤",
        category: INTERVIEW_CATEGORY_ID,
        image: TICKET_IMAGES.interview,
        message: "يرجى انتظار الإدارة، وسيتم استلام التذكرة لبدء المقابلة الفورية معك."
    }
};

function statusText(key) {
    const control = loadControl();
    return control[key] ? "🔴 مقفولة" : "🟢 مفتوحة";
}

function mainPanelEmbed() {
    return new EmbedBuilder()
        .setTitle("🎫 نظام التذاكر")
        .setDescription(`
مرحبا بك في نظام التذاكر الخاص بسيرفر Nova CFW.

يرجى اختيار نوع التذكرة المناسب من الأزرار الموجودة بالأسفل.

━━━━━━━━━━━━━━━━━━

🛠️ الدعم الفني: ${statusText("support")}
📨 الاستئناف: ${statusText("appeal")}
🚨 شكوى لاعب: ${statusText("report")}
💡 اقتراح: ${statusText("suggestion")}

━━━━━━━━━━━━━━━━━━

⚠️ الرجاء عدم فتح تذاكر بدون سبب.
⚠️ يتم إغلاق التذكرة تلقائيا بعد 24 ساعة إذا لم يحدث أي تفاعل داخلها.
`)
        .setColor("Red")
        .setImage(PANEL_IMAGE);
}

function mainPanelRow() {
    const control = loadControl();

    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("support")
                .setLabel(control.support ? "الدعم الفني مقفول" : "الدعم الفني")
                .setEmoji("🛠️")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("appeal")
                .setLabel(control.appeal ? "الاستئناف مقفول" : "استئناف")
                .setEmoji("📨")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("report")
                .setLabel(control.report ? "شكوى لاعب مقفولة" : "شكوى لاعب")
                .setEmoji("🚨")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("suggestion")
                .setLabel(control.suggestion ? "الاقتراح مقفول" : "اقتراح")
                .setEmoji("💡")
                .setStyle(ButtonStyle.Success)
        );
}

function interviewPanelEmbed() {
    return new EmbedBuilder()
        .setTitle("🎤 المقابلة الفورية")
        .setDescription(`
مرحبا بك في نظام المقابلة الفورية.

من هنا يمكنك فتح تذكرة مخصصة للمقابلة الفورية فقط.

━━━━━━━━━━━━━━━━━━

🎤 المقابلة الفورية: ${statusText("interview")}

━━━━━━━━━━━━━━━━━━

⚠️ افتح التذكرة فقط إذا كنت جاهزا للمقابلة.
⚠️ يتم إغلاق التذكرة تلقائيا بعد 24 ساعة إذا لم يحدث أي تفاعل داخلها.
`)
        .setColor("DarkRed")
        .setImage(INTERVIEW_PANEL_IMAGE);
}

function interviewPanelRow() {
    const control = loadControl();

    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("interview")
                .setLabel(control.interview ? "المقابلة الفورية مقفولة" : "فتح مقابلة فورية")
                .setEmoji("🎤")
                .setStyle(ButtonStyle.Danger)
        );
}

function controlEmbed() {
    return new EmbedBuilder()
        .setTitle("🎛️ لوحة تحكم التذاكر")
        .setDescription(`
من هنا تقدر تقفل أو تفتح كل نوع من تذاكر البانل.

━━━━━━━━━━━━━━━━━━

🛠️ الدعم الفني: ${statusText("support")}
📨 الاستئناف: ${statusText("appeal")}
🚨 شكوى لاعب: ${statusText("report")}
💡 اقتراح: ${statusText("suggestion")}
🎤 مقابلة فورية: ${statusText("interview")}

━━━━━━━━━━━━━━━━━━

اضغط على الزرار مرة للإغلاق، واضغط عليه مرة ثانية للتفعيل.
`)
        .setColor("DarkRed");
}

function controlRows() {
    const control = loadControl();

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("toggle_support")
                .setLabel(control.support ? "فتح الدعم الفني" : "إغلاق الدعم الفني")
                .setEmoji("🛠️")
                .setStyle(control.support ? ButtonStyle.Success : ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("toggle_appeal")
                .setLabel(control.appeal ? "فتح الاستئناف" : "إغلاق الاستئناف")
                .setEmoji("📨")
                .setStyle(control.appeal ? ButtonStyle.Success : ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("toggle_report")
                .setLabel(control.report ? "فتح شكوى لاعب" : "إغلاق شكوى لاعب")
                .setEmoji("🚨")
                .setStyle(control.report ? ButtonStyle.Success : ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("toggle_suggestion")
                .setLabel(control.suggestion ? "فتح الاقتراح" : "إغلاق الاقتراح")
                .setEmoji("💡")
                .setStyle(control.suggestion ? ButtonStyle.Success : ButtonStyle.Danger)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("toggle_interview")
                .setLabel(control.interview ? "فتح المقابلة الفورية" : "إغلاق المقابلة الفورية")
                .setEmoji("🎤")
                .setStyle(control.interview ? ButtonStyle.Success : ButtonStyle.Danger)
        );

    return [row1, row2];
}

async function sendOrUpdatePanels(guild) {
    const panelChannel = guild.channels.cache.get(PANEL_CHANNEL_ID);

    if (panelChannel) {
        const messages = await panelChannel.messages.fetch({ limit: 20 });

        const alreadyExists = messages.find(msg =>
            msg.author.id === client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0].title === "🎫 نظام التذاكر"
        );

        if (alreadyExists) {
            await alreadyExists.edit({
                embeds: [mainPanelEmbed()],
                components: [mainPanelRow()]
            });
        } else {
            await panelChannel.send({
                embeds: [mainPanelEmbed()],
                components: [mainPanelRow()]
            });
        }
    }

    const interviewPanelChannel = guild.channels.cache.get(INTERVIEW_PANEL_CHANNEL_ID);

    if (interviewPanelChannel) {
        const messages = await interviewPanelChannel.messages.fetch({ limit: 20 });

        const alreadyExists = messages.find(msg =>
            msg.author.id === client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0].title === "🎤 المقابلة الفورية"
        );

        if (alreadyExists) {
            await alreadyExists.edit({
                embeds: [interviewPanelEmbed()],
                components: [interviewPanelRow()]
            });
        } else {
            await interviewPanelChannel.send({
                embeds: [interviewPanelEmbed()],
                components: [interviewPanelRow()]
            });
        }
    }

    const controlChannel = guild.channels.cache.get(CONTROL_CHANNEL_ID);

    if (controlChannel) {
        const controlMessages = await controlChannel.messages.fetch({ limit: 20 });

        const controlExists = controlMessages.find(msg =>
            msg.author.id === client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0].title === "🎛️ لوحة تحكم التذاكر"
        );

        if (controlExists) {
            await controlExists.edit({
                embeds: [controlEmbed()],
                components: controlRows()
            });
        } else {
            await controlChannel.send({
                embeds: [controlEmbed()],
                components: controlRows()
            });
        }
    }
}

function ratingButtons(ticketId) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`rate_${ticketId}_1`)
                .setLabel("⭐")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`rate_${ticketId}_2`)
                .setLabel("⭐⭐")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`rate_${ticketId}_3`)
                .setLabel("⭐⭐⭐")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`rate_${ticketId}_4`)
                .setLabel("⭐⭐⭐⭐")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`rate_${ticketId}_5`)
                .setLabel("⭐⭐⭐⭐⭐")
                .setStyle(ButtonStyle.Success)
        );
}

async function closeTicket(channel, closedBy, reason, isAutoClose = false) {
    const topic = channel.topic;

    if (!topic || !topic.includes("OWNER_")) return;

    const ownerId = topic.split("_")[1];
    const type = topic.split("_")[3];
    const claimed = topic.split("_")[5];

    const user = await client.users.fetch(ownerId).catch(() => null);

    const closeEmbed = new EmbedBuilder()
        .setTitle("🔒 تم إغلاق تذكرتك")
        .setColor("Red")
        .setImage(ticketTypes[type].image)
        .addFields(
            {
                name: "نوع التذكرة",
                value: ticketTypes[type].name
            },
            {
                name: "صاحب التذكرة",
                value: `<@${ownerId}>`
            },
            {
                name: "المستلم",
                value: claimed === "none" ? "لم يتم الاستلام" : `<@${claimed}>`
            },
            {
                name: "تم الإغلاق بواسطة",
                value: isAutoClose ? "النظام التلقائي" : `${closedBy}`
            },
            {
                name: "سبب الإغلاق",
                value: reason
            }
        );

    if (user) {
        await user.send({
            embeds: [closeEmbed]
        }).catch(() => {});

        await user.send({
            content: "⭐ قيم التذكرة",
            components: [ratingButtons(channel.id)]
        }).catch(() => {});
    }

    const activity = loadActivity();
    delete activity[channel.id];
    saveActivity(activity);

    setTimeout(() => {
        channel.delete().catch(() => {});
    }, 5000);
}

client.once("ready", async () => {
    console.log(`${client.user.tag} جاهز`);

    const guild = client.guilds.cache.get(GUILD_ID);

    if (!guild) {
        console.log("السيرفر غير موجود");
        return;
    }

    await sendOrUpdatePanels(guild);

    setInterval(async () => {
        const data = loadActivity();

        for (const channelId in data) {
            const lastActivity = data[channelId];

            if (Date.now() - lastActivity >= 24 * 60 * 60 * 1000) {
                const channel = guild.channels.cache.get(channelId);

                if (!channel) {
                    delete data[channelId];
                    saveActivity(data);
                    continue;
                }

                await closeTicket(
                    channel,
                    client.user,
                    "لم يتفاعل خلال المدة 24 ساعة ⏰",
                    true
                );
            }
        }
    }, 60 * 1000);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.channel.topic) return;
    if (!message.channel.topic.includes("OWNER_")) return;

    const activity = loadActivity();
    activity[message.channel.id] = Date.now();
    saveActivity(activity);
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        //////////////////////////////
        // CONTROL PANEL
        //////////////////////////////

        if (interaction.customId.startsWith("toggle_")) {
            if (!hasAdminRole(interaction.member)) {
                return interaction.reply({
                    content: "❌ ليس لديك صلاحية",
                    ephemeral: true
                });
            }

            const typeKey = interaction.customId.replace("toggle_", "");
            const control = loadControl();

            control[typeKey] = !control[typeKey];
            saveControl(control);

            await sendOrUpdatePanels(interaction.guild);

            return interaction.reply({
                content: control[typeKey]
                    ? `🔴 تم إغلاق ${ticketTypes[typeKey].name}`
                    : `🟢 تم فتح ${ticketTypes[typeKey].name}`,
                ephemeral: true
            });
        }

        //////////////////////////////
        // OPEN TICKET
        //////////////////////////////

        if (ticketTypes[interaction.customId]) {
            const control = loadControl();

            if (control[interaction.customId]) {
                return interaction.reply({
                    content: `❌ ${ticketTypes[interaction.customId].name} مغلق حاليا`,
                    ephemeral: true
                });
            }

            const type = ticketTypes[interaction.customId];

            const already = interaction.guild.channels.cache.find(c =>
                c.topic &&
                c.topic.includes(`OWNER_${interaction.user.id}`)
            );

            if (already) {
                return interaction.reply({
                    content: `❌ عندك تذكرة مفتوحة بالفعل ${already}`,
                    ephemeral: true
                });
            }

            const ticketNumber = getTicketNumber();

            const channel = await interaction.guild.channels.create({
                name: `${type.emoji}・ticket-${ticketNumber}`,
                type: ChannelType.GuildText,
                parent: type.category,

                topic: `OWNER_${interaction.user.id}_TYPE_${interaction.customId}_CLAIM_none`,

                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                        deny: [
                            PermissionFlagsBits.SendMessages
                        ]
                    },
                    ...ADMIN_ROLE_IDS.map(role => ({
                        id: role,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }))
                ]
            });

            const activity = loadActivity();
            activity[channel.id] = Date.now();
            saveActivity(activity);

            const embed = new EmbedBuilder()
                .setTitle(`${type.emoji} ${type.name}`)
                .setColor("Red")
                .setThumbnail(interaction.user.displayAvatarURL())
                .setImage(type.image)
                .setDescription(`
# مرحبا بك في نظام التذاكر

**صاحب التذكرة:** ${interaction.user}

**نوع التذكرة:** ${type.name}

${type.message}

━━━━━━━━━━━━━━━━━━

⚠️ الرجاء شرح المشكلة أو الطلب بالكامل وبشكل واضح حتى يتم مساعدتك بأسرع وقت ممكن.

⚠️ يمنع السبام أو المنشن المتكرر للإدارة.

⚠️ لا يمكنك إرسال رسائل حتى يتم استلام التذكرة من الإدارة.

⚠️ إذا لم يحدث أي تفاعل داخل التذكرة لمدة 24 ساعة، سيتم إغلاقها تلقائيا.

━━━━━━━━━━━━━━━━━━

✅ سيتم الرد عليك من فريق الإدارة في أقرب وقت.
`);

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("claim_ticket")
                        .setLabel("استلام التذكرة")
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId("close_ticket")
                        .setLabel("إغلاق التذكرة")
                        .setEmoji("🔒")
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.send({
                content: `
## ${type.emoji} تذكرة جديدة

${interaction.user}
`,
                embeds: [embed],
                components: [buttons]
            });

            return interaction.reply({
                content: `✅ تم فتح التذكرة ${channel}`,
                ephemeral: true
            });
        }

        //////////////////////////////
        // CLAIM
        //////////////////////////////

        if (interaction.customId === "claim_ticket") {
            if (!hasAdminRole(interaction.member)) {
                return interaction.reply({
                    content: "❌ ليس لديك صلاحية",
                    ephemeral: true
                });
            }

            const ownerId = interaction.channel.topic.split("_")[1];

            await interaction.channel.permissionOverwrites.edit(ownerId, {
                SendMessages: true
            });

            const newTopic = interaction.channel.topic.replace(
                "CLAIM_none",
                `CLAIM_${interaction.user.id}`
            );

            await interaction.channel.setTopic(newTopic);

            const activity = loadActivity();
            activity[interaction.channel.id] = Date.now();
            saveActivity(activity);

            const embed = new EmbedBuilder()
                .setTitle("✅ تم استلام التذكرة")
                .setDescription(`
تم استلام التذكرة بواسطة:

${interaction.user}

يرجى الانتظار حتى يتم مراجعة طلبك بالكامل.
`)
                .setColor("Green");

            return interaction.reply({
                embeds: [embed]
            });
        }

        //////////////////////////////
        // CLOSE
        //////////////////////////////

        if (interaction.customId === "close_ticket") {
            if (!hasAdminRole(interaction.member)) {
                return interaction.reply({
                    content: "❌ ليس لديك صلاحية",
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId("close_modal")
                .setTitle("إغلاق التذكرة");

            const reason = new TextInputBuilder()
                .setCustomId("reason")
                .setLabel("سبب الإغلاق")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(reason)
            );

            return interaction.showModal(modal);
        }

        //////////////////////////////
        // RATING BUTTONS
        //////////////////////////////

        if (interaction.customId.startsWith("rate_")) {
            const data = interaction.customId.split("_");

            const ticketId = data[1];
            const stars = data[2];

            const ratings = loadRatings();

            if (ratings[`${interaction.user.id}_${ticketId}`]) {
                return interaction.reply({
                    content: "❌ قمت بالتقييم بالفعل",
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId(`ratingmodal_${ticketId}_${stars}`)
                .setTitle(`تقييم ${stars} نجوم`);

            const input = new TextInputBuilder()
                .setCustomId("ratingreason")
                .setLabel("سبب التقييم")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(input)
            );

            return interaction.showModal(modal);
        }
    }

    //////////////////////////////
    // MODALS
    //////////////////////////////

    if (interaction.isModalSubmit()) {
        if (interaction.customId === "close_modal") {
            const reason = interaction.fields.getTextInputValue("reason");

            await interaction.reply({
                content: "✅ سيتم حذف التذكرة خلال 5 ثواني",
                ephemeral: true
            });

            await closeTicket(interaction.channel, interaction.user, reason, false);
        }

        if (interaction.customId.startsWith("ratingmodal_")) {
            const data = interaction.customId.split("_");

            const ticketId = data[1];
            const stars = data[2];

            const reason = interaction.fields.getTextInputValue("ratingreason");

            const ratings = loadRatings();

            ratings[`${interaction.user.id}_${ticketId}`] = true;

            saveRatings(ratings);

            const channel = await client.channels.fetch(RATING_CHANNEL_ID);

            const embed = new EmbedBuilder()
                .setTitle("⭐ تقييم جديد")
                .setColor("Gold")
                .addFields(
                    {
                        name: "الشخص",
                        value: `${interaction.user}`
                    },
                    {
                        name: "عدد النجوم",
                        value: `${stars} ⭐`
                    },
                    {
                        name: "سبب التقييم",
                        value: reason
                    }
                );

            await channel.send({
                embeds: [embed]
            });

            return interaction.reply({
                content: "✅ شكرا على تقييمك",
                ephemeral: true
            });
        }
    }
});

client.login(TOKEN);
