import GastosList from '@/components/GastosList';

const Gastos = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona y registra todos los gastos del negocio.
                </p>
            </div>
            <GastosList />
        </div>
    );
};

export default Gastos;
