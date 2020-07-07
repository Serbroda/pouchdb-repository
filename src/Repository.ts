import PouchDB from 'pouchdb-node';
import PouchFind from 'pouchdb-find';
import { v4 as uuidv4 } from 'uuid';

PouchDB.plugin(PouchFind);

import { Entity } from './Entity';

export interface RepositoryOptions extends PouchDB.Configuration.LocalDatabaseConfiguration {}

export enum RepositoryChangeType {
    ADDED = 'ADDED',
    MODIFIED = 'MODIFIED',
    DELETED = 'DELETED',
}

export type OnRepositoryChange<T extends Entity> = { (type: RepositoryChangeType, data?: T): void };
export type OnRepositoryChangeFilter<T extends Entity> = { (type: RepositoryChangeType, data?: T): boolean };

interface RepositoryChangeHandler<T extends Entity> {
    dbChanges: PouchDB.Core.Changes<T>;
    handler: OnRepositoryChange<T>;
    filter?: OnRepositoryChangeFilter<T>;
}

export class Repository<T extends Entity> {
    private readonly db: PouchDB.Database<T>;
    private changeListeners: RepositoryChangeHandler<T>[] = [];

    constructor(
        private readonly name: string,
        private readonly options: RepositoryOptions = {
            prefix: './db/',
            auto_compaction: true,
        }
    ) {
        this.db = new PouchDB(options.name || name, options);
    }

    public async save(item: T): Promise<T> {
        const now = new Date();
        if (this._isNew(item)) {
            item._id = uuidv4();
            item.created = now;
        }
        item.lastModified = now;

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

        const entity = await this.get(id);
        if (entity) {
            entity._deleted = true;
            await this.save(entity);
        }
    }

    public async removeAll(items: (string | T)[]): Promise<void> {
        for (let item of items) {
            await this.remove(item);
        }
    }

    public async query(options: PouchDB.Find.FindRequest<T> = { selector: {} }): Promise<T[]> {
        const docs = await this.db.find(options);
        return docs.docs as T[];
    }

    public async clear(): Promise<void> {
        await this.removeAll(await this.query());
    }

    public onChange(handler: OnRepositoryChange<T>, filter?: OnRepositoryChangeFilter<T>) {
        const dbChanges = this._listenForDbChangedIfNecessary(handler, filter);
        this.changeListeners.push({
            dbChanges,
            handler,
            filter,
        });
    }

    public removeOnChangeListener(handler: OnRepositoryChange<T>) {
        const index = this.changeListeners.findIndex((h) => h.handler === handler);
        if (index > -1) {
            this.changeListeners[index].dbChanges.cancel();
            this.changeListeners.splice(index, 1);
        }
    }

    public removeAllChangeListener() {
        this.changeListeners.forEach((cl) => cl.dbChanges.cancel());
        this.changeListeners = [];
    }

    private _isNew(entity: T): boolean {
        return entity._id === undefined;
    }

    private _listenForDbChangedIfNecessary(
        handler: OnRepositoryChange<T>,
        filter?: OnRepositoryChangeFilter<T>
    ): PouchDB.Core.Changes<T> {
        return this.db
            .changes({
                since: 'now',
                live: true,
                include_docs: true,
            })
            .on('change', (change) => {
                let changeType: RepositoryChangeType;

                if (change.deleted !== undefined && change.deleted === true) {
                    changeType = RepositoryChangeType.DELETED;
                } else if (change.doc?._rev.startsWith('1-')) {
                    changeType = RepositoryChangeType.ADDED;
                } else {
                    changeType = RepositoryChangeType.MODIFIED;
                }
                if (filter) {
                    if (filter(changeType, change.doc)) {
                        handler(changeType, change.doc);
                    }
                } else {
                    handler(changeType, change.doc);
                }
            });
    }
}
