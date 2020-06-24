import { Entity } from '../Entity';
import { Repository } from '../Repository';

interface ITestEntity extends Entity {
    name: string;
    age: number;
}

class TestEntityRepository extends Repository<ITestEntity> {
    constructor() {
        super('test');
    }
}

const repo = new TestEntityRepository();

it('should save entity', async () => {
    const entity = await repo.save({ name: 'John', age: 29 });
    expect(entity).not.toBeUndefined();
    expect(entity).not.toBeNull();
});

it('should generate id', async () => {
    const entity = await repo.save({ name: 'John', age: 29 });
    expect(entity._id).toMatch(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}$/);
});
