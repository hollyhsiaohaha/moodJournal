import { TabMenu } from 'primereact/tabmenu';


function Header() {
    const items = [
        {label: 'Home', icon: 'pi pi-fw pi-home', url: '/'},
        {label: 'Journals', icon: 'pi pi-fw pi-inbox'},
        {label: 'Graph', icon: 'pi pi-fw pi-share-alt'},
        {label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar'},
        {label: 'User', icon: 'pi pi-fw pi-user'}
    ];

    return (
        <div className="card">
            <TabMenu model={items} />
        </div>
    )

}

export default Header;
