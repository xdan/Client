/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import iDataPages, { field, prop, component, ModsDecl } from 'super/i-data-pages/i-data-pages';
export * from 'super/i-data-pages/i-data-pages';

export type SortDate = CanArray<Date>;
export type SortDir = 'asc' | 'desc';

export type RequestParams = StrictDictionary<{
	page: number;
	perPage: number;
	sort: string;
	dir: SortDir;
	keepTime: boolean;
	date: SortDate;
	dateField: string;
}>;

export interface Sort {
	field: string;
	dir: SortDir;
}

export const
	$$ = symbolGenerator();

@component()
export default class bGrid<T extends Dictionary = Dictionary> extends iDataPages<T> {
	/**
	 * Sort field
	 */
	@prop(String)
	readonly sort: string = 'createdDate';

	/**
	 * Sort direction
	 */
	@prop(String)
	readonly dir: SortDir = 'desc';

	/**
	 * If true, then time from .date wont be skipped
	 */
	@prop(Boolean)
	readonly keepTime: boolean = false;

	/**
	 * Request date
	 */
	@prop({type: [Date, Array], required: false})
	readonly date?: SortDate;

	/**
	 * Request date field
	 */
	@prop(String)
	readonly dateField: string = 'createdDate';

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		loading: [
			'true',
			['false']
		]
	};

	/** @override */
	@field((o) => o.createWatchObject('get', [
		'page',
		'perPage',
		'sort',
		'dir',
		'keepTime',
		['date', (val: SortDate) => o.h.setJSONToUTC(val)],
		'dateField'
	]))

	protected readonly requestParams!: RequestParams;

	/** @override */
	protected readonly $refs!: {loadPageTrigger: HTMLElement};

	/**
	 * Toggles sort direction
	 * @emits toggleDir(dir: SortDir)
	 */
	protected toggleDir(): string {
		const dir = this.requestParams.get.dir = <SortDir>{asc: 'desc', desc: 'asc'}[this.requestParams.get.dir];
		this.emit('toggleDir', dir);
		return dir;
	}

	/**
	 * Sets grid sort for the specified field
	 *
	 * @param field
	 * @emits setSort(sort: Sort)
	 */
	protected setSort(field: string): {field: string; dir: SortDir} {
		const
			p = this.requestParams.get;

		if (p.sort === field) {
			this.toggleDir();

		} else {
			p.sort = field;
		}

		const obj = {field, dir: p.dir};
		this.emit('setSort', obj);
		return obj;
	}

	/** @override */
	protected addData(data: T): {upd: Function; type: 'upd'} {
		const
			mut = super.addData(data);

		const
			{date, sort, dir} = this.requestParams.get;

		if ((!sort || {createdDate: true, modifiedDate: true}[sort]) &&
				this.checkDateFactory(date, data)() &&
				(!this.lazyLoad && this.page !== 1)
		) {
			return {
				...mut,
				upd: () => {
					if (!this.db) {
						return;
					}

					this.db.total++;
					this.db.data[dir === 'asc' ? 'push' : 'unshift'](data);
				}
			};
		}

		return mut;
	}

	/** @override */
	protected updData(data: T, i: number): {type: 'upd' | 'del'; upd: Function; del: Function} {
		const
			mut = super.updData(data, i);

		const
			{date, sort} = this.requestParams.get;

		if (sort && !{createdDate: true, modifiedDate: true}[sort] || !this.checkDateFactory(date, data)()) {
			return {...mut, type: 'del'};
		}

		return {...mut, type: 'upd'};
	}

	/**
	 * Factory for dates comparing
	 *
	 * @param date
	 * @param data
	 */
	protected checkDateFactory(date: SortDate, data: Dictionary): Function {
		return () => {
			const normalizedDate = Object.isDate(date) ? [date] : date;
			return $C(normalizedDate).every((date, i, obj) =>
				$C(['createdDate', 'modifiedDate']).some((field) => {
					let
						d = data[field];

					if (!d) {
						return;
					}

					if (!this.keepTime) {
						date = date.clone().beginningOfDay();
						d = (<Date>d).short();
					}

					if (obj.length === 1) {
						return date.is(<Date>d);
					}

					return date.is(<Date>d) || i ? date.isAfter(<Date>d) : date.isBefore(<Date>d);
				})
			);
		};
	}
}
