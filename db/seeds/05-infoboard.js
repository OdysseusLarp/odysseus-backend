const infos = [
    {
	priority: 1,
	enabled: true,
	title: 'Test slide 1',
	body: '<b>Lorem ipsum dolor sit amet, an mei liber timeam regione, enim viris invenire vis et. Dolor blandit expetendis pro at. Graeci conceptam dissentiet in duo. Ut lorem augue audiam quo.</b>'
    },
    {
	priority: 1,
	enabled: true,
	title: 'Test slide 2',
	body: '<p>An sonet scripserit eum, id malorum expetenda consetetur usu. Persius quaestio an nec, partem complectitur te duo. Ut petentium corrumpit qui, novum epicuri scribentur sed ei, dicit viderer ut duo. Ex summo qualisque eum, sit viris ceteros definitiones et. Sed ut vero legere nostrum, ius rationibus constituam instructior ei.</p><p>Pro ei nisl nostro quaestio, mucius adipiscing concludaturque eum cu, eos mutat sapientem efficiendi cu. Luptatum probatus maluisset eu usu, duo ignota tincidunt ea, sit agam inani homero ad. Assum regione ad eum, vix cu dicit iisque tincidunt. Per facete euripidis ei, no decore nostrum adipiscing pri, pri et posse omnes mediocrem. Persequeris liberavisse cum at, ad sit hinc nominavi eloquentiam, ridens oblique explicari an sed.</p>'
    },
    {
	priority: 7,
	enabled: true,
	title: 'Jump prep started',
	body: '<p text-align="center">The ship is now preparing for a jump.</p>'
    },
    {
	priority: 8,
	enabled: true,
	title: 'Jump prep completed',
	body: '<b text-align="center">The ship is now ready to jump at a short notice.</b>'
    },
    {
	priority: 9,
	enabled: true,
	title: 'Jump sequence initiated',
	body: '<b text-align="center">Jump in %%JUMP%% seconds.</b>'
    },
];

exports.seed = async knex => {
    await knex('infoboard_entry').del();
    await knex('infoboard_entry').insert(infos);
    await knex('infoboard_priority').del();
    await knex('infoboard_priority').insert({priority: 1});
};
