import { Entity } from '../Entity';
import { Repository } from '../Repository';

interface ITestEntity extends Entity {
    name?: string;
    age?: number;
}

class TestEntityRepository extends Repository<ITestEntity> {
    constructor() {
        super('test');
    }
}

const repo = new TestEntityRepository();
const createEntity = (data?: ITestEntity) => {
    const def: ITestEntity = { name: 'John', age: 29 };
    return { ...def, ...data };
};

beforeEach(async () => {
    await repo.clear();
});

it('should save entity', async () => {
    const entity = await repo.save(createEntity());
    expect(entity).not.toBeUndefined();
    expect(entity).not.toBeNull();
});

it('should generate id', async () => {
    const entity = await repo.save(createEntity());
    expect(entity._id).toMatch(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}$/);
});

it('should save all entities', async () => {
    const entities = await repo.saveAll([createEntity(), createEntity()]);
    expect(entities).not.toBeUndefined();
    expect(entities).not.toBeNull();
    expect(entities.length).toBe(2);
});

it('should get entity by id', async () => {
    const id = (await repo.save(createEntity()))._id;
    const entity = await repo.get(id!);
    expect(entity).not.toBeUndefined();
    expect(entity).not.toBeNull();
});

it('should query entities', async () => {
    await repo.save(createEntity({ name: 'Max', age: 45 }));
    await repo.save(createEntity({ name: 'Julia', age: 26 }));
    await repo.save(createEntity({ name: 'Emma', age: 26 }));

    const results1 = await repo.query();
    expect(results1).not.toBeUndefined();
    expect(results1).not.toBeNull();
    expect(results1.length).toBe(3);

    const results2 = await repo.query({ selector: { name: 'Julia' } });
    expect(results2).not.toBeUndefined();
    expect(results2).not.toBeNull();
    expect(results2.length).toBe(1);
    expect(results2[0].name).toBe('Julia');

    const results3 = await repo.query({ selector: { age: 26 } });
    expect(results3).not.toBeUndefined();
    expect(results3).not.toBeNull();
    expect(results3.length).toBe(2);
    expect(results3[0].age).toBe(26);
});

it('should clear repository', async () => {
    const entities = await repo.saveAll([createEntity(), createEntity()]);
    expect(entities).not.toBeUndefined();
    expect(entities).not.toBeNull();
    expect(entities.length).toBe(2);

    await repo.clear();
    const results1 = await repo.query();
    expect(results1).not.toBeUndefined();
    expect(results1).not.toBeNull();
    expect(results1.length).toBe(0);
});

it('should remove entity', async () => {
    const entity1 = await repo.save(createEntity());
    const entity2 = await repo.save(createEntity());
    const entity3 = await repo.save(createEntity());
    const entity4 = await repo.save(createEntity());

    let results = await repo.query();
    expect(results.length).toBe(4);

    await repo.remove(entity1);
    results = await repo.query();
    expect(results.length).toBe(3);

    await repo.remove(entity2._id!);
    results = await repo.query();
    expect(results.length).toBe(2);
});

it('should remove all given entities', async () => {
    const entity1 = await repo.save(createEntity());
    const entity2 = await repo.save(createEntity());
    const entity3 = await repo.save(createEntity());
    const entity4 = await repo.save(createEntity());

    let results = await repo.query();
    expect(results.length).toBe(4);

    await repo.removeAll([entity1, entity2, entity3]);
    results = await repo.query();
    expect(results.length).toBe(1);
});
