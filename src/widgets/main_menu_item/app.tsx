import LoaderScreen from '@jetbrains/ring-ui-built/components/loader-screen/loader-screen'
import Heading from '@jetbrains/ring-ui-built/components/heading/heading';
import List from '@jetbrains/ring-ui-built/components/list/list';
import ErrorMessage from '@jetbrains/ring-ui-built/components/error-message/error-message';
import FrownIcon from '@jetbrains/icons/frown';
import Toggle from '@jetbrains/ring-ui-built/components/toggle/toggle';
import { useProjects } from '../../providers/projects_provider';
import { useFlag } from '../../providers/flag_provider';
import './app.css';


const App = () => {
  const { projectsLoading, projectError, projects } = useProjects()
  const { flagLoading, flagError, flag, toggle } = useFlag()

  if (projectsLoading || flagLoading) {
    return <div className='widget'>
      <LoaderScreen />
    </div>
  }

  return (
    <div className='widget'>
      {/* Error message */}
      {
        (projectError || flagError) && (
          <ErrorMessage
            icon={FrownIcon}
            code='Disconnected' message={"failed to load data"}
            description={'Please try again or contact admin'} />
        )
      }
      {/* Global flag*/}
      <div>
        <Toggle
          size="M"
          checked={flag ?? false}
          onChange={(e) => toggle(e.target.checked)}>
          Global flag
        </Toggle>
      </div>
      {/* Projects list */}
      <div className='projects'>
        <Heading level={3}>Projects</Heading>
        {!projects || projects.length === 0 ?
          (
            <div className='no-projects'>
              No projects available to your account.
            </div>
          ) :
          (
            <List
              data={projects!.map(p => ({
                key: p.id,
                label: `${p.shortName || p.id} — ${p.name || ''}`
              }))} />
          )
        }
      </div>
    </div>
  );
}

export default App;