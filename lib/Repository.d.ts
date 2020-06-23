/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-find" />
import { Entity } from './Entity';
export interface RepositoryOptions {
    db: PouchDB.Configuration.LocalDatabaseConfiguration;
    deletedFlag?: boolean;
}
export declare type OnRepositoryChange<T> = {
    (data: T): void;
};
export declare class Repository<T extends Entity> {
    private readonly table;
    private readonly options;
    private readonly db;
    private changeListeners;
    constructor(table: string, options?: RepositoryOptions);
    save(item: T): Promise<T>;
    saveAll(items: T[]): Promise<T[]>;
    get(id: string, options?: PouchDB.Core.GetOptions): Promise<T | undefined>;
    remove(item: string | T): Promise<void>;
    removeAll(items: (string | T)[]): Promise<void>;
    query(options?: PouchDB.Find.FindRequest<T>): Promise<T[]>;
    onChange(handler: OnRepositoryChange<T>): void;
    removeOnChangeListener(handler: OnRepositoryChange<T>): void;
    private _isNew;
}
//# sourceMappingURL=Repository.d.ts.map