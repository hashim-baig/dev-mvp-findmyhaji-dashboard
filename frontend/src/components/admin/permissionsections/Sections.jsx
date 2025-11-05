import { CardContent, CardHeader, CardTitle } from '../../ui/card';

export default function Sections(props) {
  
  const handleToggle = (field, value) => {
    props.handleInputChange(props.menuId, field, value);
  };
  return (
    <CardContent className="pb-4 border-t border-gray-100">
          {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
        <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-sm font-bold text-gray-900 mb-2">
                {props.title}
            </CardTitle>
            <hr/>
            <p className="text-gray-600 pt-2">Manage Access</p>
        </CardHeader>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Add
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    List
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delete
                </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleToggle('add_permission', !props.permissions.add_permission ? 1 : 0)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          props.permissions.add_permission ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          props.permissions.add_permission ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleToggle('list_permission', !props.permissions.list_permission ? 1 : 0)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          props.permissions.list_permission ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          props.permissions.list_permission ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleToggle('update_permission', !props.permissions.update_permission ? 1 : 0)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          props.permissions.update_permission ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          props.permissions.update_permission ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleToggle('delete_permission', !props.permissions.delete_permission ? 1 : 0)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          props.permissions.delete_permission ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          props.permissions.delete_permission ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                </tr>
            </tbody>
            </table>
        </div>
        </div>
    </CardContent>
    );
}