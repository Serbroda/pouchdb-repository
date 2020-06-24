import PouchDB from 'pouchdb-node';
import PouchFind from 'pouchdb-find';
import { v4 as uuidv4 } from 'uuid';

PouchDB.plugin(PouchFind);

import { Entity } from './Entity';

export interface RepositoryOptions {
    db: PouchDB.Configuration.LocalDatabaseConfiguration;
    deletedFlag?: boolean;
}

export type OnRepositoryChange<T> = { (data: T): void };

export class Repository<T extends Entity> {
    private readonly db: PouchDB.Database<T>;
    private changeListeners: OnRepositoryChange<T>[] = [];

    constructor(
        private readonly table: string,
        private readonly options: RepositoryOptions = { db: { name: 'db' }, deletedFlag: true }
    ) {
        this.table = table;
        this.db = new PouchDB(options.db.name, options.db);
        this.db
            .changes({
                since: 'now',
                live: true,
                filter: (doc) => {
                    return doc.$table === this.table;
                },
            })
            .on('change', async (change) => {
                const entity = await this.get(change.id);
                if (entity) {
                    this.changeListeners.forEach((listener) => {
                        listener(entity);
                    });
                }
            });
    }

    public async save(item: T): Promise<T> {
        const now = new Date();
        if (this._isNew(item)) {
            item._id = uuidv4();
            item.created = now;
        }
        item.lastModified = now;
        item = { ...item, $table: this.table };

        const doc = await this.db.put(item);
        item._id = doc.id;
        item._rev = doc.rev;
        return item;
    }

    public async saveAll(items: T[]): Promise<T[]> {
        let results: T[] = [];
        for (let item of items) {
            results.push(await this.save(item));
        }
        return results;
    }

    public async get(id: string, options: PouchDB.Core.GetOptions = {}): Promise<T | undefined> {
        try {
            // TODO: Get with table name
            return await this.db.get(id, options);
        } catch (e) {
            return undefined;
        }
    }

    public async remove(item: string | T): Promise<void> {
        let id = typeof item === 'string' ? item : item._id;
        if (id === undefined) {
            return;
        }

        if (this.options.deletedFlag) {
            const entity = await this.get(id);
            if (entity) {
                entity._deleted = true;
                await this.save(entity);
            }
        } else {
            const doc = await this.db.get(id);
            await this.db.remove(doc._id, doc._rev);
        }
    }

    public async removeAll(items: (string | T)[]): Promise<void> {
        for (let item of items) {
            await this.remove(item);
        }
    }

    public async query(options: PouchDB.Find.FindRequest<T> = { selector: { $table: this.table } }): Promise<T[]> {
        if (options.selector && !options.selector.$table) {
            options.selector = { ...options.selector, ...{ $table: this.table } };
        }
        const docs = await this.db.find(options);
        return docs.docs as T[];
    }

    public async clear(): Promise<void> {
        await this.removeAll(await this.query({ selector: { $table: this.table } }));
    }

    public onChange(handler: OnRepositoryChange<T>) {
        this.changeListeners.push(handler);
    }

    public removeOnChangeListener(handler: OnRepositoryChange<T>) {
        this.changeListeners = this.changeListeners.filter((h) => h !== handler);
    }

    public removeAllChangeListener() {
        this.changeListeners = [];
    }

    private _isNew(entity: T): boolean {
        return entity._id === undefined;
    }
}
