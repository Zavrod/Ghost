import Avatar from '../../../admin-x-ds/global/Avatar';
import Button from '../../../admin-x-ds/global/Button';
import InviteUserModal from './modals/InviteUserModal';
import List from '../../../admin-x-ds/global/List';
import ListItem from '../../../admin-x-ds/global/ListItem';
import NiceModal from '@ebay/nice-modal-react';
import NoValueLabel from '../../../admin-x-ds/global/NoValueLabel';
import React from 'react';
import SettingGroup from '../../../admin-x-ds/settings/SettingGroup';
import TabView from '../../../admin-x-ds/global/TabView';
import UserDetailModal from './modals/UserDetailModal';
import useStaffUsers from '../../../hooks/useStaffUsers';
import {User} from '../../../types/api';

const Owner: React.FC<{user: User}> = ({user}) => {
    const showDetailModal = () => {
        NiceModal.show(UserDetailModal, {user});
    };

    if (!user) {
        return null;
    }
    return (
        <div className='group flex gap-3 hover:cursor-pointer' onClick={showDetailModal}>
            <Avatar bgColor='yellow' label='DV' />
            <div className='flex flex-col'>
                <span>{user.name} &mdash; <strong>Owner</strong> <span className='invisible ml-2 inline-block text-sm font-bold text-green group-hover:visible'>Edit</span></span>
                <span className='text-xs text-grey-700'>{user.email}</span>
            </div>
        </div>
    );
};

interface UsersListProps {
    users: User[];
    updateUser?: (user: User) => void;
}

const UsersList: React.FC<UsersListProps> = ({users, updateUser}) => {
    const showDetailModal = (user: User) => {
        NiceModal.show(UserDetailModal, {user, updateUser});
    };

    if (!users || !users.length) {
        return (
            <NoValueLabel icon='single-user-neutral-block'>
                No users found.
            </NoValueLabel>
        );
    }

    return (
        <List>
            {users.map((user) => {
                return (
                    <ListItem
                        key={user.id}
                        action={<Button color='green' label='Edit' link={true} onClick={() => showDetailModal(user)}/>}
                        avatar={(<Avatar bgColor='green' label='DV' labelColor='white' />)}
                        detail={user.email}
                        hideActions={true}
                        id={`list-item-${user.id}`}
                        title={user.name}
                        onClick={() => showDetailModal(user)} />
                );
            })}
        </List>
    );
};

const Users: React.FC = () => {
    const {
        ownerUser,
        adminUsers,
        editorUsers,
        authorUsers,
        contributorUsers,
        updateUser
    } = useStaffUsers();

    const showInviteModal = () => {
        NiceModal.show(InviteUserModal);
    };

    const buttons = (
        <Button color='green' label='Invite users' link={true} onClick={() => {
            showInviteModal();
        }} />
    );

    const tabs = [
        {
            id: 'users-admins',
            title: 'Administrators',
            contents: (<UsersList updateUser={updateUser} users={adminUsers} />)
        },
        {
            id: 'users-editors',
            title: 'Editors',
            contents: (<UsersList updateUser={updateUser} users={editorUsers} />)
        },
        {
            id: 'users-authors',
            title: 'Authors',
            contents: (<UsersList updateUser={updateUser} users={authorUsers} />)
        },
        {
            id: 'users-contributors',
            title: 'Contributors',
            contents: (<UsersList updateUser={updateUser} users={contributorUsers} />)
        },
        {
            id: 'users-invited',
            title: 'Invited',
            contents: (<></>)
        }
    ];

    return (
        <SettingGroup
            customButtons={buttons}
            title='Users and permissions'
        >
            <Owner user={ownerUser} />
            <TabView tabs={tabs} />
        </SettingGroup>
    );
};

export default Users;