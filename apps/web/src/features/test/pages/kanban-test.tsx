import { KanbanBoard, KanbanCard, KanbanCards, KanbanHeader, KanbanProvider } from '@workspace/ui/components/kanban';
import { useState } from 'react';

const columns = [
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
];

// Simpler data for smaller cards - Vietnamese position titles
const exampleFeatures = [
  { id: '1', name: 'Nhân viên', column: 'active', subtitle: 'nhan_vien', status: 'active' },
  { id: '2', name: 'Quản lý', column: 'active', subtitle: 'quan_ly', status: 'active' },
  { id: '3', name: 'Giám đốc', column: 'inactive', subtitle: 'giam_doc', status: 'inactive' },
  { id: '4', name: 'Trưởng phòng', column: 'active', subtitle: 'truong_phong', status: 'active' },
  { id: '5', name: 'Phó giám đốc', column: 'inactive', subtitle: 'pho_giam_doc', status: 'inactive' },
];

const KanbanTestPage = () => {
  const [features, setFeatures] = useState(exampleFeatures);

  return (
    <div className="h-screen w-full bg-background p-6">
      <div className="mx-auto max-w-[800px]">
        <div className="mb-4">
          <h1 className="font-semibold text-xl">Chức danh</h1>
          <div className="mt-3 flex gap-2">
            <button className="rounded-md border px-3 py-1 text-sm">List</button>
            <button className="rounded-md border px-3 py-1 text-sm">Record Detail</button>
            <button className="rounded-md border bg-primary px-3 py-1 text-primary-foreground text-sm">Kanban</button>
          </div>
        </div>

        <div className="h-[400px]">
          <KanbanProvider columns={columns} data={features} onDataChange={setFeatures} className="h-full gap-4">
            {(column) => (
              <KanbanBoard id={column.id} key={column.id} className="min-h-[200px]">
                <KanbanHeader className="border-b px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {column.name}
                      <span className="ml-2 text-muted-foreground">
                        {features.filter((f) => f.column === column.id).length}
                      </span>
                    </span>
                  </div>
                </KanbanHeader>
                <KanbanCards id={column.id} className="p-3">
                  {(feature: (typeof features)[number]) => (
                    <KanbanCard
                      column={column.id}
                      id={feature.id}
                      key={feature.id}
                      name={feature.name}
                      className="mb-2"
                    >
                      <div className="space-y-1">
                        <p className="m-0 font-medium text-sm">{feature.name}</p>
                        <p className="m-0 text-muted-foreground text-xs">Mã chức danh: {feature.subtitle}</p>
                        <p className="m-0 text-xs">
                          <span className="text-muted-foreground">Trạng thái: </span>
                          <span className={feature.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                            {feature.status}
                          </span>
                        </p>
                      </div>
                    </KanbanCard>
                  )}
                </KanbanCards>
              </KanbanBoard>
            )}
          </KanbanProvider>
        </div>
      </div>
    </div>
  );
};

export default KanbanTestPage;
